/*

  SmartClient Ajax RIA system
  Version v13.0p_2023-09-15/LGPL Deployment (2023-09-15)

  Copyright 2000 and beyond Isomorphic Software, Inc. All rights reserved.
  "SmartClient" is a trademark of Isomorphic Software, Inc.

  LICENSE NOTICE
     INSTALLATION OR USE OF THIS SOFTWARE INDICATES YOUR ACCEPTANCE OF
     ISOMORPHIC SOFTWARE LICENSE TERMS. If you have received this file
     without an accompanying Isomorphic Software license file, please
     contact licensing@isomorphic.com for details. Unauthorized copying and
     use of this software is a violation of international copyright law.

  DEVELOPMENT ONLY - DO NOT DEPLOY
     This software is provided for evaluation, training, and development
     purposes only. It may include supplementary components that are not
     licensed for deployment. The separate DEPLOY package for this release
     contains SmartClient components that are licensed for deployment.

  PROPRIETARY & PROTECTED MATERIAL
     This software contains proprietary materials that are protected by
     contract and intellectual property law. You are expressly prohibited
     from attempting to reverse engineer this software or modify this
     software for human readability.

  CONTACT ISOMORPHIC
     For more information regarding license rights and restrictions, or to
     report possible license violations, please contact Isomorphic Software
     by email (licensing@isomorphic.com) or web (www.isomorphic.com).

*/
// Encapsulates various bits of logic for generating, converting, and 
// presenting stack traces.
isc.defineClass("StackTrace");

isc.StackTrace.addClassMethods({
    // Creates a StackTrace from a browser-native exception stack
    //
    // For instance:
    // 
    // try {
    //     eval("bob ===== 7;");
    // }
    // catch (e) {
    //     if (e.stack) {
    //         var trace = isc.StackTrace.fromNativeStack(e.stack);
    //         var output = trace.toString();
    //     }
    // }
    //
    // Chooses the correct subclass based on the browser. If the browser
    // native stack is not supported yet for te browswer, it will simply
    // output the stack itself.
    fromNativeStack : function (stack) {
        if (isc.Browser.isMoz) {
            return isc.MozStackTrace.create({stack: stack});
        } else if (isc.Browser.isChrome) {
            return isc.ChromeStackTrace.create({stack: stack});
        } else if (isc.Browser.isIE) {
            return isc.IEStackTrace.create({stack: stack});
        } else {
            return isc.UnsupportedStackTrace.create({stack: stack});
        }
    },

    // return an intelligently shortened version of the source file and line number
    getSourceLine : function (sourceLine, appDir, hostAndProtocol) {
        appDir = appDir || isc.Page.getAppDir();
        hostAndProtocol = hostAndProtocol || window.location.protocol + "//" + window.location.host;

        sourceLine = sourceLine.replace(/(\?|\&)?sc_selenium=true/, "");

        // detect core modules
        var modulesStart = sourceLine.indexOf("/system/modules/ISC_"),
            devModulesStart = sourceLine.indexOf("/system/development/ISC_");
           
        // core modules: trim off everything but module name
        if (modulesStart != -1) {
            sourceLine = sourceLine.substring(modulesStart + 16);
        } else if (devModulesStart != -1) {
            sourceLine = sourceLine.substring(devModulesStart + 20) + "[d]";
        }

        if (modulesStart != -1 || devModulesStart != -1) {
            // option to not show core modules    
            if (!isc.Log.logIsDebugEnabled("traceLineNumbersCore")) return "";

            // core modules: trim out the version parameter (just noise)
            var versionIndex = sourceLine.indexOf("?isc_version");
            if (versionIndex != -1) {
                sourceLine = sourceLine.substring(0, versionIndex) +
                    sourceLine.substring(sourceLine.indexOf(":"));
            }
        }
           
        // other files: show obviously relative paths as relative
        if (sourceLine.startsWith(appDir)) {
            sourceLine = sourceLine.substring(appDir.length);
        } else if (sourceLine.startsWith(hostAndProtocol)) {
            sourceLine = sourceLine.substring(hostAndProtocol.length);
        }

        return " @ " + sourceLine;
    }
});


isc.StackTrace.addProperties({
    // Provide the browser-native stack on creation    
    
    stack: null,

    // number of lines in error.stack before actual functions are lised off.  Eg Chrome stacks
    // start with the error message ("Reference error: ...").
    preambleLines : 0,

    // Where we store the "converted" stack trace in readable format
    // Access via the toString() method.
    _output: "",

    init : function() {
        if (this.stack) {
            this._parseStack();
        }
    },

    // Should extract the function name from a line of the stack
    // Implement in a browser-specific subclass
    extractFunctionFromLine : function (line) {
        this.logError("Should implement extractFunctionFromLine in subclass");
    },

    // Should extract the arguments from a line of the stack
    // Implement in a browser-specific subclass
    extractArgumentsFromLine : function (line) {
        this.logError("Should implement extractArgumentsFromLine in subclass");
    },

    // Should extract the source file and line number from a line of the stack
    // Implement in a browser-specific subclass
    extractSourceFromLine : function (line) {
        this.logError("Should implement extractSourceFromLine in subclass");
    },

    // Parse native stack trace
    // ---------------------------------------------------------------------------------------
    // Do an in-browser transform of the native stack to make it more readable.
    //
    // FF theoretically provides an onerror notification, but it seems flaky, and it is not
    // possible to walk the stack via arguments.caller.callee in this notification even when it
    // does fire.  So the best we can get when an error occurs is the native error.stack,
    // which we transform here for readability.
    //
    // How good is it:
    // - if function names have been embedded into framework code with server-side help, we can
    //   correctly identify and print the class and method for all framework functions that go
    //   through the obfuscator
    //   - this is better than the current state of parsing with the help of a server-side Perl
    //     script, which frequently misidentifies functions 
    // - worse than stack walking via arguments.callee.caller, where:
    //   - we can identify all functions, regardless of whether they went through the
    //     obfuscator
    //   - we can directly access arguments and format them more meaningfully (eg, show than an
    //     object being passed to a method is an SC class, and show it's ID)
    _parseStack : function () {
        // Parse inside a try/catch block so that we can simply use the supplied
        // stack as the output if an error occurs in parsing.
        try {
            var lines = this.stack.split("\n"),
                output = isc.StringBuffer.create(),
                appDir = isc.Page.getAppDir(),
                hostAndProtocol = window.location.protocol + "//" + window.location.host;
        
            //isc.logWarn("original trace: " + lines.join("\n\n"));
        
            for (var i = this.preambleLines; i < lines.length; i++) {
                var line = lines[i],
                    argNames = null,
                    className = null,
                    methodName = null;

                if (isc.isAn.emptyString(line)) continue;
        
                //isc.logWarn("parsing line: " + line);
        
                var functionName = this.extractFunctionFromLine(line); 
                if (functionName == "") {
                    functionName = "unnamed";
                } else if (functionName.startsWith("isc_")) {
                    var isClassMethod;
                    if (functionName.startsWith("isc_c_")) {
                        functionName = functionName.substring(6);
                        isClassMethod = true;
                    } else {
                        functionName = functionName.substring(4);
                    }
                    className = functionName.substring(0, functionName.indexOf("_"));
                    methodName = functionName.substring(className.length+1);
        
                    var clazz = isc.ClassFactory.getClass(className),
                        method = null;
                    if (clazz) {
                        method = isClassMethod ? 
                            clazz[methodName] : clazz.getInstanceProperty(methodName);
                    }
                    // if we figure out what actual method is being referred to, we can find
                    // out the official argument names and show them
                    if (method != null) {
                        functionName = isc.Func.getName(method, true);
                        //isc.logWarn("Got live method: " + isc.Func.getName(method, true) +
                        //            " from functionName: " + functionName);
                        var argString;
                        if (!isClassMethod) {
                            // takes into account StringMethods
                            argString = clazz.getArgString(methodName);
                        } else {
                            argString = isc.Func.getArgString(method);
                        }
                        argNames = argString.split(",");
                        // NOTE: we checked to see if the live stack might still be there, since that would
                        // let us just call the normal getStackTrace() facility with the exception just
                        // serving to help us locate the leaf method, but as expected, only the stack above
                        // the try..catch is intact.  This does mean that we could call getStackTrace() for
                        // the top of the stack instead of parsing the Moz native trace, but not currently
                        // doing this since it could hit recursion issues and might mislead you into
                        // thinking two arguments differed since our traces provide more information (eg
                        // they look for an ID and display that)
                        //if (method.caller) {
                        //    isc.logWarn("method.caller: " + isc.Func.getName(method.caller, true) +
                        //                "\n" + isc.Log.getCallTrace(method.caller.arguments));
                    } else {
                        functionName = functionName.replace(/_{1}/, ".");
                        functionName = functionName.replace(/_{2}/, "._");
                    }
                }
        
                output.append("    ", functionName, "(");
        
                var argString = this.extractArgumentsFromLine(line);
                var argNum = 0;
            
                while (argString && argString.length > 0) {
                    if (argNum > 0) output.append(", ");
                    if (argNames) output.append(argNames[argNum] + "=>");
                    var lastLength = argString.length;
                    argString = this._parseArgument(argString, output);
                    if (argString.length == lastLength) {
                        isc.logWarn("failure to parse next arg at:\n" + argString);
                        break;
                    }
                    argNum++;
                }
                                                    
                output.append(")");

                // add source path and line number
                var atIndex = line.lastIndexOf("@");
                output.append(isc.StackTrace.getSourceLine(this.extractSourceFromLine(line),
                                                           appDir, hostAndProtocol));

                output.append("\n");
            }

            this._output = output.release(false);
        }
        // If there are any errors, we just store the stack itself as output
        catch (e) {
            this._output = this.stack;
        }
    },

    // parse an argument from a line in a native stack trace
    _parseArgument : function (argString, output) {
        //isc.logWarn("parsing argString: " + argString);
       
        var firstChar = argString.charAt(0);
    
        if (firstChar == "\"") { // string argument
            // look for an unquoted closing quote
            var stringEnd = argString.search(/[^\\]"/);
            if (stringEnd == -1) stringEnd = argString.length; // shouldn't happen
    
            var stringArg = argString.substring(0, stringEnd+2);
            // enforce max size
            if (stringArg.length > 40) {
                stringArg = stringArg.substring(0,40) + "...\"[ " + stringArg.length + "]";
            }
            output.append(stringArg);
            return argString.substring(stringEnd+3);
    
        } else if (firstChar == "[") { // object argument
            var closeBrace = argString.substring(1).indexOf("]"),
                objectString = argString.substring(0, closeBrace+2);
            // shorten this common case
            if (objectString == "[object Object]") objectString = "{Obj}";
    
            output.append(objectString);
            return argString.substring(closeBrace+3);
    
        } else if (argString.startsWith("(void 0)")) {
            output.append("undef");
            return argString.substring(9);
    
        } else if (argString.startsWith("undefined")) {
            output.append("undef");
            return argString.substring(10);
    
        } else if (argString.startsWith("(function ")) {
            var signature = argString.substring(1,argString.indexOf("{"));
            if (signature.endsWith(" ")) signature = signature.substring(0, signature.length-1);
            output.append(signature);
    
            var functionEnd = argString.indexOf("}),");
            if (functionEnd == -1) return ""; // no more arguments
            return argString.substring(functionEnd+3);
    
        } else { // other argument
            var nextComma = argString.indexOf(",");
            if (nextComma == -1) nextComma = argString.length;
            output.append(argString.substring(0, nextComma));
            return argString.substring(nextComma+1);
        }
    }
});
    
// NOTE: toString functions CANNOT be added by addMethods, because a property named "toString"
// will not be enumerated by for..in.  This is actually part of the ECMAScript standard!

isc.StackTrace.getPrototype().toString = function () {
    // Return the normalized output
        return this._output;
};

// The native stack trace for Mozilla has changed.  For FF14 and above, the arguments are 
// no longer supplied and the native stack trace looks like:
//
// isc_Canvas_editSummaryField@http://localhost:49011/isomorphic/system/modules/ISC_Core.js?isc_version=v13.0p_2023-09-15.js:30870
// isc_Canvas_addSummaryField@http://localhost:49011/isomorphic/system/modules/ISC_Core.js?isc_version=v13.0p_2023-09-15.js:30865
// anonymous@http://localhost:49011/isomorphic/system/modules/ISC_Core.js?isc_version=v13.0p_2023-09-15.js:420
// isc_Menu_selectMenuItem@http://localhost:49011/isomorphic/system/modules/ISC_Grids.js?isc_version=v13.0p_2023-09-15.js:28093
// isc_Menu_rowClick@http://localhost:49011/isomorphic/system/modules/ISC_Grids.js?isc_version=v13.0p_2023-09-15.js:28059
// anonymous@http://localhost:49011/isomorphic/system/modules/ISC_Grids.js?isc_version=v13.0p_2023-09-15.js:7836
// isc_GridRenderer__rowClick@http://localhost:49011/isomorphic/system/modules/ISC_Grids.js?isc_version=v13.0p_2023-09-15.js:6199
// isc_c_Class_invokeSuper@http://localhost:49011/isomorphic/system/modules/ISC_Core.js?isc_version=v13.0p_2023-09-15.js:2263
// isc_c_Class_Super@http://localhost:49011/isomorphic/system/modules/ISC_Core.js?isc_version=v13.0p_2023-09-15.js:2198
// isc_GridBody__rowClick@http://localhost:49011/isomorphic/system/modules/ISC_Grids.js?isc_version=v13.0p_2023-09-15.js:6793
// isc_GridRenderer_click@http://localhost:49011/isomorphic/system/modules/ISC_Grids.js?isc_version=v13.0p_2023-09-15.js:6178
// isc_Canvas_handleClick@http://localhost:49011/isomorphic/system/modules/ISC_Core.js?isc_version=v13.0p_2023-09-15.js:25741
// isc_c_EventHandler_bubbleEvent@http://localhost:49011/isomorphic/system/modules/ISC_Core.js?isc_version=v13.0p_2023-09-15.js:15164
// isc_c_EventHandler_handleClick@http://localhost:49011/isomorphic/system/modules/ISC_Core.js?isc_version=v13.0p_2023-09-15.js:14083
// isc_c_EventHandler__handleMouseUp@http://localhost:49011/isomorphic/system/modules/ISC_Core.js?isc_version=v13.0p_2023-09-15.js:13973
// isc_c_EventHandler_handleMouseUp@http://localhost:49011/isomorphic/system/modules/ISC_Core.js?isc_version=v13.0p_2023-09-15.js:13916
// isc_c_EventHandler_dispatch@http://localhost:49011/isomorphic/system/modules/ISC_Core.js?isc_version=v13.0p_2023-09-15.js:15541
// anonymous@http://localhost:49011/isomorphic/system/modules/ISC_Core.js?isc_version=v13.0p_2023-09-15.js:420
//
// For FF13 and earlier, the lines from the native stack trace look something like this:
//
// eval("bob ==== 7;")@:0
// ()@http://localhost:40011/isomorphic/QA/Debug/StackTrace.test:45
// ()@http://localhost:40011/isomorphic/QA/Debug/StackTrace.test:40
// ()@http://localhost:40011/isomorphic/QA/Debug/StackTrace.test:36
// ([object Object],[object Object])@http://localhost:40011/isomorphic/QA/Debug/StackTrace.test:56 
// isc_TestCase_run()@http://localhost:40011/isomorphic/system/modules/ISC_Core.js?isc_version=dev.js:29775
// isc_TestRunner_runTests(0)@http://localhost:40011/isomorphic/system/modules/ISC_Core.js?isc_version=dev.js:29920
// isc_TestRunner_init([object Object],(void 0),(void 0),(void 0),(void 0),(void 0),(void 0),(void 0),(void 0),(void 0),(void 0),(void 0),(void 0))@http://localhost:40011/isomorphic/system/modules/ISC_Core.js?isc_version=dev.js:29882
// isc_Class_completeCreation([object Object],(void 0),(void 0),(void 0),(void 0),(void 0),(void 0),(void 0),(void 0),(void 0),(void 0),(void 0),(void 0))@http://localhost:40011/isomorphic/system/modules/ISC_Core.js?isc_version=dev.js:2323



isc.defineClass("MozStackTrace", isc.StackTrace).addProperties({
    // Parse a line from the stack and extract the function name
    extractFunctionFromLine : function (line) {
        var noArgs = isc.Browser.version >= 14,
            parenIndex = line.indexOf(noArgs ? "@" : "(");
        return line.substring(0, parenIndex);
    },

    // Parse a line from the stack and extract the arguments
    extractArgumentsFromLine : function (line) {
        if (isc.Browser.version >= 14) return "";
        var parenIndex = line.indexOf("(");
        var atIndex = line.lastIndexOf("@");
        return line.substring(parenIndex + 1, atIndex - 1);
    },

    // Extract the source file and line numver from a line
    extractSourceFromLine : function (line) {
        var atIndex = line.lastIndexOf("@");
        if (atIndex >= 0) {
            return line.substring(atIndex + 1);
        } else {
            return "";
        }
    }
});

// Browser specific subclass for Google Chrome
// NOTE: we don't use this code by default because we instead use an obscure prepareStackTrace
// API in Chrome.  See debug.js, look for "useChromeAPIToPrepareStackTrace"
//
// Given this code:
//
//   isc.Page.setEvent("load", function foo () {
//       try { 
//           var arr = [];
//           arr.myFunc = function () { crash() };
//           arr.myFunc();
//       } catch (e) {
//           isc.logWarn(e.stack);
//       }
//   });
//
// Error.stack looks like this:
//
//  ReferenceError: crash is not defined
//      at Array.myFunc (http://mime:15011/isomorphic/QA/scratch.jsp:776:31)
//      at Object.foo [as action] (http://mime:15011/isomorphic/QA/scratch.jsp:777:8)
//      at Object.isc_c_Page_handleEvent [as handleEvent] (http://mime:15011/isomorphic/system/modules/ISC_Core.js?isc_version=dev.js:10998:17)
//      at isc_c_EventHandler_handleLoad (http://mime:15011/isomorphic/system/modules/ISC_Core.js?isc_version=dev.js:11702:17)
//
// 1. "Object." and "Array." is the native type of the "this" value.  Yes, incredibly useless
//     given that they clearly have the "this" value and its type is all we get.  May not be
//     present for something executed in global scope (last line)
// 2. "[as action]" means the function was invoked under the name "action" even though the
//     function is named foo.
// 
// More background on special cases here, at the bottom:
//   http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
isc.defineClass("ChromeStackTrace", isc.StackTrace).addMethods({ 
    preambleLines:1,
    _functionRegexp: /at (Object\.)?([^ ]+)/,
    _sourceRegexp: /\((.+)\)/,

    // Parse a line from the stack and extract the function name
    extractFunctionFromLine : function (line) {
        var match = line.match(this._functionRegexp);
        return match ? match[2] : "";
    },

    // Parse a line from the stack and extract the arguments
    // Chrome does not appear to show the arguments ...
    extractArgumentsFromLine : function (line) {
        return "";
    },

    // Extract the source file and line numver from a line
    extractSourceFromLine : function (line) {
        var match = line.match(this._sourceRegexp);
        return match ? match[1] : "";
    }
});

// Chrome-specific code for getting stack information; see useChromeAPIToPrepareStackTrace
isc.ChromeStackTrace.addClassMethods({

    
    _getFuncArgs : function (func) {
        try {
            if (func != null) return func.arguments;
        } catch (t) {};
    },

    // return the last CallSites trace array captured by Error.prepareStackTrace()
    _getLastErrorCallSitesParsedStack : function (loggingTarget) {
        if (!isc._lastErrorCallSites) return "";

        // resolve function arguments if not already done
        this._resolveCallSiteFunctionArguments();

        var parsedStackBuffer = isc.StringBuffer.create(),
            isTimerTimeoutFunctionWithoutStackTrace = null;

        for (var i = 0; i < isc._lastErrorCallSites.length; i++) {
            var currentCallSite = isc._lastErrorCallSites[i],
            currentCallSiteThis = currentCallSite.getThis();
            if (!currentCallSiteThis) {
                continue;
            }
            var scType = null,
                nativeType = currentCallSite.getTypeName(),
                functionName = currentCallSite.getFunctionName(),
                func         = currentCallSite.getFunction();

            if (!functionName) { // null or ""
                functionName = "<anonymous>";
            } else {
                if (functionName && functionName.startsWith("isc_")) {
                    // class method, name is like isc_c_EventHandler_handleLoad, or
                    // instance method, name is like SectionStack_dragResizeStart
                    var offset = functionName.startsWith("isc_c_") ? 6 : 4;
                    functionName = functionName.substring(offset);

                    // note: we're assuming no SC classes have an underscore in their
                    // name; if they did, the natively returned functionName is ambiguous
                    var firstUnderscore = functionName.indexOf("_");
                    scType = functionName.substring(0, firstUnderscore);
                    functionName = functionName.substring(firstUnderscore + 1);
                } else {
                    // some kind of non-instance non-class method, trim off everything but
                    // the method name as such
                    functionName = functionName.substring(functionName.lastIndexOf(".") + 1);
                }
            }
            var modifier = this._getFunctionModifier(functionName, scType, func);
            var fullFunctionName = (scType != null ? scType : nativeType) + "." + functionName;

            var resolvedArgs = currentCallSite.resolvedArguments;
            if (resolvedArgs == null) {
                // arguments are only available for functions that are still on the stack,
                // so if we are called from a catch{} block we will only report arguments
                // for methods above the catch block 
                resolvedArgs = "(<no args: exited>)";
            }
            // for global methods, omit the useless type information
            if (scType == null && (nativeType == "Object" || nativeType == "Window")) {
                fullFunctionName = functionName;
            }
            parsedStackBuffer.append("\t", modifier, fullFunctionName, resolvedArgs, " ");

            // add "this" object information to the frame line detail if useful
            if (isc.isAn.Instance(currentCallSiteThis) ||
                isc.isA.ClassObject(currentCallSiteThis))
            {
                parsedStackBuffer.append("on ", loggingTarget.echoLeaf(currentCallSiteThis),
                                         " ");
            }

            // getMethodName tries to determine the slot where a function exists in an
            // object, is very slow and doesn't return much new information, so
            // don't use it
            //                var mn = currentCallSite.getMethodName(); 
            //                if (mn) {
            //                    parsedStackBuffer.append("[as ", mn, "] ");
            //                }
            
            // get fileName and line number
            var fileName = currentCallSite.getFileName();
            if (fileName) {
                fileName = fileName.substring(fileName.lastIndexOf("/") + 1)
                var questionIndex = fileName.lastIndexOf("?");
                if (questionIndex > 0) {
                    fileName = fileName.substring(0, questionIndex);
                }
                parsedStackBuffer.append("@ ", fileName);
            } else {
                parsedStackBuffer.append("@ [no file]");
            }
            parsedStackBuffer.append(
                ":", currentCallSite.getLineNumber(),
                ":", currentCallSite.getColumnNumber(), "\n");
            // pick up stored stack traces that show how setTimeout() was called, leading
            // to the current thread

            var funcArgs = this._getFuncArgs(func);
            if (funcArgs != null && funcArgs.timerTrace) {
                parsedStackBuffer.append("Stack trace for setTimeout() call:\n" +
                                         funcArgs.timerTrace);
                isTimerTimeoutFunctionWithoutStackTrace = false;
            } else if (fullFunctionName == "Timer.__fireTimeout" &&
                       isTimerTimeoutFunctionWithoutStackTrace == null)
            {
                isTimerTimeoutFunctionWithoutStackTrace = true;
            }
        }
        if (isTimerTimeoutFunctionWithoutStackTrace && isc.Timer.currentAction && 
            isc.Timer.currentAction.timerTrace)
        {
            parsedStackBuffer.append("Stack trace for setTimeout() call:\n" + isc.Timer.currentAction.timerTrace);
        }
        delete isc._lastErrorCallSites;

        return parsedStackBuffer.release(false);
    },

    _getFunctionModifier : function (functionName, type, func) {
        if (type == null) return "";
        var clazz = isc.ClassFactory.getClass(type);
        return (func._instanceSpecific ?
                (func._isOverride ? "[o]" : "[a]") : isc._emptyString) +
                ((clazz != null && clazz[functionName] === func) ? "[c]" : isc._emptyString);
    },

    // _add/_containsCallSiteFunction maintain a hashset of the functions we've processed
    
    _addCallSiteFunction : function (functionName, functionObj) {
        var errorCallSites = isc._lastErrorCallSites,
            functionSet = errorCallSites.functionSet;
        if (!functionSet) {
            functionSet = errorCallSites.functionSet = {};
        }
        var nameBucket = functionSet[functionName];
        if (isc.isAn.Array(nameBucket))                nameBucket.add(functionObj);
        else if (nameBucket) functionSet[functionName] = [nameBucket, functionObj];
        else                 functionSet[functionName] =              functionObj;
    },

    _containsCallSiteFunction : function (functionName, functionObj) {
        var errorCallSites = isc._lastErrorCallSites,
            functionSet = errorCallSites.functionSet;
        if (!functionSet) return false;

        var nameBucket = functionSet[functionName];
        return nameBucket == functionObj ||
            isc.isAn.Array(nameBucket) && nameBucket.contains(functionObj);
    },

    
    _resolveCallSiteFirstArgsIndex : function () {

        var errorCallSites = isc._lastErrorCallSites,
            firstArgsIndex = errorCallSites.firstArgsIndex;
        if (firstArgsIndex != null) return;

        var currentCallSites,
            errorCallSites = isc._lastErrorCallSites;

        // preserve existing Error hook
        var originalPrepareStackTrace = Error.prepareStackTrace;
        delete Error.prepareStackTrace;
        // install a temporary hook to measure stack depth
        Error.prepareStackTrace = function (error, structuredStackTrace) {
            currentCallSites = structuredStackTrace;
        };
        // access "stack" property to trigger lazy execution
        var stack = new Error().stack; 
        // restore the original hook
        Error.prepareStackTrace = originalPrepareStackTrace;

        
        var minimumDepth = Math.min(currentCallSites.length, errorCallSites.length),
            currentIndex = currentCallSites.length - minimumDepth,
            errorIndex   =   errorCallSites.length - minimumDepth;

        for (var i = 0; i < minimumDepth; i++, errorIndex++, currentIndex++) {
            if (errorCallSites[errorIndex].getFunction() ==
                currentCallSites[currentIndex].getFunction()) break;
        }

        errorCallSites.firstArgsIndex = errorIndex;

        // account for functions in current stack that we've skipped
        for (var i = 0; i < currentIndex; i++) {
            var currentCallSite = currentCallSites[i];
            this._addCallSiteFunction(currentCallSite.getFunctionName(), 
                                      currentCallSite.getFunction());
        }
    },

    // for each CallSite, resolve the function arguments to a string and attach it;
    
    _resolveCallSiteFunctionArguments : function () {

        this._resolveCallSiteFirstArgsIndex();

        var errorCallSites = isc._lastErrorCallSites;
        if (errorCallSites.argumentsResolved) return;

        var firstArgsIndex = errorCallSites.firstArgsIndex;

        for (var i = firstArgsIndex; i < errorCallSites.length; i++) {
            var errorCallSite = errorCallSites[i],
                func = errorCallSite.getFunction(),
                name = errorCallSite.getFunctionName();
            if (this._getFuncArgs(func) == null) continue;

            // since the arguments are actually pulled off the function object, only
            // the top frame for each function has valid arguments available
            var args = "";
            if (this._containsCallSiteFunction(name, func)) {
                args = "(<no args: recursion>) ";
            } else {
                var argNames = isc.Func.getArgs(func);
                if (argNames.length > 0) {
                    var argValues = func.arguments;
                    for (var j = 0; j < argNames.length; j++) {
                        if (j != 0) {
                            args += ", ";
                        }
                        args += argNames[j] + "=>" + isc.echoLeaf(argValues[j]);
                    }
                    args = "(" + args + ")";
                } else {
                    args = "()";
                }
                this._addCallSiteFunction(name, func);
            }
            
            errorCallSites[i].resolvedArguments = args;
        }

        errorCallSites.argumentsResolved = true;
    }

});


// The error.stack from IE10 looks like:
//
// "TypeError: Unable to set property 'foo' of undefined or null reference
//   at isc_Canvas_editSummaryField (http://localhost:49011/isomorphic/system/modules/ISC_Core.js?isc_version=v13.0p_2023-09-15.js:30842:5)
//   at sc_Canvas_addSummaryField (http://localhost:49011/isomorphic/system/modules/ISC_Core.js?isc_version=v13.0p_2023-09-15.js:30837:5)
//   at Function code (Function code:1:1)
//   at isc_Menu_selectMenuItem (http://localhost:49011/isomorphic/system/modules/ISC_Grids.js?isc_version=v13.0p_2023-09-15.js:28093:9)
//   at isc_Menu_rowClick (http://localhost:49011/isomorphic/system/modules/ISC_Grids.js?isc_version=v13.0p_2023-09-15.js:28059:5)
//   at Function code (Function code:1:142)
//   at isc_GridRenderer__rowClick (http://localhost:49011/isomorphic/system/modules/ISC_Grids.js?isc_version=v13.0p_2023-09-15.js:6199:5)
//   at isc_c_Class_invokeSuper (http://localhost:49011/isomorphic/system/modules/ISC_Core.js?isc_version=v13.0p_2023-09-15.js:2262:17)
//   at isc_c_Class_Super (http://localhost:49011/isomorphic/system/modules/ISC_Core.js?isc_version=v13.0p_2023-09-15.js:2198:9)
//   at isc_GridBody__rowClick (http://localhost:49011/isomorphic/system/modules/ISC_Grids.js?isc_version=v13.0p_2023-09-15.js:679[3:13)

isc.defineClass("IEStackTrace", isc.StackTrace).addMethods({
    preambleLines:1,
    _functionRegexp: /at ((?:[A-Za-z_$0-9]+ )+)/,
    _sourceRegexp: /\((.+)\)/,

    // Parse a line from the stack and extract the function name
    extractFunctionFromLine : function (line) {
        var match = line.match(this._functionRegexp);
        return match ? match[1] : "";
    },

    // Parse a line from the stack and extract the arguments
    // IE does not appear to show the arguments ...
    extractArgumentsFromLine : function (line) {
        return "";
    },

    // Extract the source file and line numver from a line
    extractSourceFromLine : function (line) {
        var match = line.match(this._sourceRegexp);
        return match ? match[1] : "";
    }
});

// Subclass for unsupported browsers
isc.defineClass("UnsupportedStackTrace", isc.StackTrace).addMethods({
    // For parseStack, just do nothing
    _parseStack : function () {

    }
});

// NOTE: toString functions CANNOT be added by addMethods, because a property named "toString"
// will not be enumerated by for..in.  This is actually part of the ECMAScript standard!

isc.UnsupportedStackTrace.getPrototype().toString = function () {
    return this.stack;
};

// override Error.prepareStackTrace function for Chrome browser
if (isc.Browser.isChrome) {
    isc.StackTrace._prepareStackTraceUserDefinedFunction = null;
    if (Error.prepareStackTrace != null) {
        isc.StackTrace._prepareStackTraceUserDefinedFunction = Error.prepareStackTrace;
    }
    // there is no original prepareStackTrace function in Chrome - it just check if
    // we defined the method, so to get originally formatted error message we need to
    // temporary delete our prepareStackTrace method and rethrow the error just to
    // retrieve formatted message.
    
    // This method handles three different situations:
    // 1. There were no Error.prepareStackTrace method defined
    // 2. Error.prepareStackTrace method was defined before we override it
    // 3. Error.prepareStackTrace method was defined after we override it but it saves and
    // calls our method
    Error.prepareStackTrace = function (error, structuredStackTrace) {
        isc._lastErrorCallSites = structuredStackTrace;
        if (error.getStackTraceOnly) {
            return isc._emptyString;
        }
        // we need to return originally formatted error message;
        var origErrorMessage = null;
        if (isc.StackTrace._prepareStackTraceUserDefinedFunction != null) {
            origErrorMessage = isc.StackTrace._prepareStackTraceUserDefinedFunction(error, 
                                                                    structuredStackTrace);
        } else {
            // User could override our prepareStackTrace function after we defined it. In
            // this case Error.prepareStackTrace will be his method, otherwise it will be 
            // this function.
            var overriddenPrepareStackTraceFunction = Error.prepareStackTrace;
            delete Error.prepareStackTrace;
            try { 
                throw error;
            } catch (e) {
                origErrorMessage = e.stack;
            }
            Error.prepareStackTrace = overriddenPrepareStackTraceFunction;
        }
        return origErrorMessage;
    }

    
    Error.stackTraceLimit = Infinity;
};
