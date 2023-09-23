/*

  SmartClient Ajax RIA system
  Version v13.0p_2023-09-15/EVAL Development Only (2023-09-15)

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

if(window.isc&&window.isc.module_Core&&!window.isc.module_RealtimeMessaging){isc.module_RealtimeMessaging=1;isc._moduleStart=isc._RealtimeMessaging_start=(isc.timestamp?isc.timestamp():new Date().getTime());if(isc._moduleEnd&&(!isc.Log||(isc.Log&&isc.Log.logIsDebugEnabled('loadTime')))){isc._pTM={message:'RealtimeMessaging load/parse time: '+(isc._moduleStart-isc._moduleEnd)+'ms',category:'loadTime'};if(isc.Log&&isc.Log.logDebug)isc.Log.logDebug(isc._pTM.message,'loadTime');else if(isc._preLog)isc._preLog[isc._preLog.length]=isc._pTM;else isc._preLog=[isc._pTM]}isc.definingFramework=true;if(window.isc&&isc.version!="v13.0p_2023-09-15/EVAL Development Only"&&!isc.DevUtil){isc.$113h=function(){var _1=false;if(isc.version.toLowerCase().contains("pro")||isc.version.toLowerCase().contains("lgpl")){_1=true}else{var _2=isc.version;if(_2.indexOf("/")!=-1){_2=_2.substring(0,_2.indexOf("/"))}
var _3="v13.0p_2023-09-15/EVAL Development Only";if(_3.indexOf("/")!=-1){_3=_3.substring(0,_3.indexOf("/"))}
if(_2!=_3){_1=true}}
if(_1){isc.logWarn("SmartClient module version mismatch detected: This application is loading the core module from SmartClient version '"+isc.version+"' and additional modules from 'v13.0p_2023-09-15/EVAL Development Only'. Mixing resources from different SmartClient packages is not supported and may lead to unpredictable behavior. If you are deploying resources from a single package you may need to clear your browser cache, or restart your browser."+(isc.Browser.isSGWT?" SmartGWT developers may also need to clear the gwt-unitCache and run a GWT Compile.":""))}}
isc.$113h()}
isc.ClassFactory.defineClass("Messaging");isc.A=isc.Messaging;isc.B=isc._allFuncs;isc.C=isc.B._maxIndex;isc.D=isc._funcClasses;isc.D[isc.C]=isc.A.Class;isc.A.messagingURL="[ISOMORPHIC]/messaging";isc.A.websocketURL="[ISOMORPHIC]/websocket";isc.A.useEventSource=true;isc.A.useWebSocket=true;isc.A.fallBackToComet=true;isc.A.webSocketConnectTimeout=10000;isc.A.$zq=1;isc.A._channels={};isc.A.$zt=[];isc.A.$zu=250;isc.A.connectTimeout=4000;isc.A.clientID=isc.Math.randomUUID();isc.A.legacyCommHTTPMethod="GET";isc.A.enableServerLogging=isc.Log.logIsEnabledFor(isc.Log.DEBUG,"Messaging");isc.B.push(isc.A.$195o=function isc_c_Messaging__useEventSource(){return this.useEventSource&&!!window.EventSource&&(!isc.Browser.isSafari||parseFloat(isc.Browser.rawSafariVersion)>=534.29)},isc.A.$195p=function isc_c_Messaging__useWebSocket(){return this.useWebSocket&&!!window.WebSocket},isc.A.$255l=function isc_c_Messaging__shouldContinueUsingWebSockets(){return this.$189x||!this.fallBackToComet},isc.A.useAJAX=function isc_c_Messaging_useAJAX(){return!this.$195o()&&!this.$195p()&&((isc.Browser.isFirefox&&isc.Browser.minorVersion<4)||isc.Browser.isSafari)},isc.A.$1129=function isc_c_Messaging__sendDisconnectUponConnect(){return!this.$195o()&&!this.$195p()&&isc.Browser.isSafari&&!isc.Browser.isChrome&&!this.$189a});isc.B._maxIndex=isc.C+5;isc.A=isc.Messaging;isc.B=isc._allFuncs;isc.C=isc.B._maxIndex;isc.D=isc._funcClasses;isc.D[isc.C]=isc.A.Class;isc.A.$171c=[];isc.A.$192j="conn_";isc.A.$192k=1;isc.B.push(isc.A.send=function isc_c_Messaging_send(_1,_2,_3,_4){if(!isc.hasOptionalModules("RealtimeMessaging")&&!this.isRemoteDebug){this.logWarn("RealtimeMessaging not licensed - refusing to send()");return}
if(!isc.isAn.Array(_1))_1=[_1];if(_4&&_4.sequenced){this.$171c.add({channels:_1,data:_2,callback:_3,requestProperties:_4});if(this.$171c.length>1)return}
this.$139v(_1,_2,_3,_4)},isc.A.$139v=function isc_c_Messaging__send(_1,_2,_3,_4){if(this.$195p()&&this.$zr&&this.$zr.webSocket){this.$zr.webSocket.send(isc.Comm.serialize({command:"send",sendToChannels:_1,data:_2},false));this.fireCallback(_3)}else{isc.DMI.callBuiltin({methodName:"messagingSend",callback:"isc.Messaging.$zv(data, rpcRequest)",arguments:[{type:"send",sendToChannels:_1,subscribedChannels:this._channels,data:_2}],requestParams:isc.addProperties({showPrompt:false,callback:_3,willHandleError:_3!=null},_4)})}},isc.A.$zv=function isc_c_Messaging__sendCallback(_1,_2){if(_2&&_2.sequenced){this.$171c.removeAt(0);var _3=this.$171c[0];if(_3){this.$139v(_3.channels,_3.data,_3.callback,_3.requestProperties)}}},isc.A.getSubscribedChannels=function isc_c_Messaging_getSubscribedChannels(){return isc.getKeys(this._channels)},isc.A.subscribe=function isc_c_Messaging_subscribe(_1,_2,_3,_4,_5){if(!isc.hasOptionalModules("RealtimeMessaging")&&!this.isRemoteDebug){this.logWarn("RealtimeMessaging not licensed - refusing to subscribe()");return}
if(isc.MultiWindow.canShareMessageChannels()){isc.MultiWindow.messagingSubscribe(_1,_2,_3,_4,_5);return}
this.$2388(_1,_2,_3,_4,_5)},isc.A.$2388=function isc_c_Messaging__subscribe(_1,_2,_3,_4,_5){var _6=true;if(!this._channels[_1]||_4!=null||_5!=null){this._channels[_1]={};if(_5)this._channels[_1].data=_5;if(_4)this._channels[_1].selector=_4;this._channels[_1].subscriptionCallback=_3;this.$zw("subscribe ("+_1+")");_6=false}
this._channels[_1].callback=_2;if(_6){this.fireCallback(_3,null,null,null,true)}},isc.A.unsubscribe=function isc_c_Messaging_unsubscribe(_1){if(isc.MultiWindow.canShareMessageChannels()){isc.MultiWindow.messagingUnsubscribe(_1);return}
this.$2389(_1)},isc.A.$2389=function isc_c_Messaging__unsubscribe(_1){if(!this._channels[_1])return;delete this._channels[_1];this.$zw("unsubscribe ("+_1+")");if(isc.isAn.emptyObject(this._channels))this.disconnect()},isc.A.connected=function isc_c_Messaging_connected(){return this._channels&&isc.getKeys(this._channels).length>0&&this.$159v},isc.A.disconnect=function isc_c_Messaging_disconnect(_1){this._channels={};isc.Timer.clear(this.$zz);this.$zz=null;isc.Timer.clear(this.$z0);this.$z0=null;if(this.isConnectedToDurableJMS()){if(this.$195p()&&this.$zr&&this.$zr.webSocket){this.$233d=true;this.$zr.webSocket.send(isc.Comm.serialize({command:"clientConnTerminate"},false));if(_1){this.$233e=_1}}else{this.$74q({noConnectionDownCallback:true});this.delayCall("$233f",[_1],1000)}
return}
this.$233g(_1)},isc.A.$233h=function isc_c_Messaging__clientConnTerminateComplete(){var _1=this.$233e;delete this.$233e;this.$233g(_1)},isc.A.$233g=function isc_c_Messaging__disconnect(_1){this.$74q({noConnectionDownCallback:true});delete this.$233d;this.$233f(_1)},isc.A.$233f=function isc_c_Messaging__fireDisconnectCallbacks(_1){this.connectionDown();if(_1)this.fireCallback(_1)},isc.A.$zw=function isc_c_Messaging__reconnect(_1){this.logDebug("$zw: "+(_1||"No reason provided"));this.$192l();if(!isc.Page.isLoaded()){if(!this.$1124){isc.Page.setEvent("load","isc.Messaging.$zw('page load')");this.$1124=true}
return}
if(!this.$zz){this.$zz=isc.Timer.setTimeout("isc.Messaging.$z1()",this.$zq,isc.Timer.MSEC)}},isc.A.$z2=function isc_c_Messaging__connectRetry(){this.$192m(this.$zs);this.$zs=null;this.logDebug("connect within specified connectTimeout: "+this.connectTimeout+"ms failed, retrying");this.$zw('connect retry')},isc.A._serverConnTerminate=function isc_c_Messaging__serverConnTerminate(_1){this.$zw('serverConnTerminate: '+_1)},isc.A.generateNextConnectionID=function isc_c_Messaging_generateNextConnectionID(){return this.$192j+(this.$192k++)},isc.A.isConnectedToDurableJMS=function isc_c_Messaging_isConnectedToDurableJMS(){return this.$159v&&this.dispatcherImplementer&&this.useDurableTopics},isc.A.$z1=function isc_c_Messaging__connect(){var _1=this;if(this.isConnectedToDurableJMS()){this.disconnect(function(){delete this.useDurableTopics;_1.$z1()})}
if(this.$zr)this.$192m(this.$zr);if(this.usingAJAX&&!isc.Page.isLoaded()){if(!this.$1124){isc.Page.setEvent("load","isc.Messaging.$zw('page load')");this.$1124=true}
return}
isc.Timer.clear(this.$zz);this.$zz=null;if(this.$zs){this.$z3=true;this.logDebug("connect pending - deferring openConnection request.");return}
if(this.getSubscribedChannels().length==0)return;this.$zs={connectionID:this.generateNextConnectionID()};var _2={type:"connect",clientID:this.clientID,connectionID:this.$zs.connectionID,subscribedChannels:isc.Comm.serialize(this._channels)};var _3=this.$195p()?isc.Page.getURL(this.websocketURL).replace(/^http(s)?/i,"ws$1"):isc.Page.getURL(this.messagingURL);var _4=isc.URIBuilder.create(_3);_4.setQueryParam("ts",isc.timestamp());if(!this.enableServerLogging)_4.setQueryParam("isc_noLog","1");if(this.$1129()){_4.setQueryParam("disconnectUponConnect","true");this.$189a=true}
this.logDebug("proceeding to connect");if(this.$195p()){this.logDebug("Using WebSocket for comm");for(var _5 in _2){if(!_2.hasOwnProperty(_5))continue;_4.setQueryParam(_5,String(_2[_5]))}
var _6=this.$zs.webSocket=new WebSocket(_4.uri);this.$189w=isc.Timer.setTimeout(function(){if(_1.$159v)return;if(_1.$255l()){_1.logDebug("websocket timed out to: "+_4.uri+" - the connection will be reattempted")}else{_1.logDebug("websocket timed out to: "+_4.uri+" - downgrading to next available protocol");_1.useWebSocket=false}
_1.$zs=null;_1.$189b();_1.$zw("downgrade from websocket - initial timer")},this.webSocketConnectTimeout,isc.Timer.MSEC);_6.onopen=function(_19){isc.Timer.clearTimeout(_1.$189w);delete _1.webSocketInitTimer;_1.logDebug("websocket connected to: "+_4.uri)};_6.onerror=function(_19){isc.Timer.clearTimeout(_1.$189w);delete _1.$189w;if(_1.$233d){_1.$233h()}
_1.logDebug("websocket error connecting to: "+_4.uri+": "+isc.echoFull(_19));if(_1.$255l()){_1.logDebug("websocket protocol known working - continuing to retry")}else{_1.logDebug("marking websocket protocol unavailable - downgrading to next available protocol");_1.useWebSocket=false;_1.$zs=null;_1.$189b();_1.$zw('downgrade from websocket - onerror handler')}};_6.onmessage=function(_19){var _7=isc.eval("var message = "+_19.data+";message;");if(_7.command){if(_7.command=="connectCallback"){_1.$189x=true;_1._connectCallback(_7.connectionID,_7.config);_1.$1887()}else if(_7.command=="keepalive"){_1._keepalive(_7.connectionID)}else if(_7.command=="serverConnTerminate"){_1._serverConnTerminate(_7.connectionID)}else if(_7.command=="clientConnTerminateComplete"){_1.$233h()}}else{_1._message(_7)}};_6.onclose=function(_19){var _8=_19.code;var _9=_19.reason;_1.logDebug("Connection closed - code: "+_8+", reason: "+_9)}}else if(this.$195o()){this.logDebug("Using EventSource for comm");var _10=isc.HiddenFrame.create({useHtmlfile:isc.Browser.isIE});_10.$ic();this.$zs.commFrame=_10;for(var _5 in _2){if(!_2.hasOwnProperty(_5))continue;_4.setQueryParam(_5,String(_2[_5]))}
_4.setQueryParam("eventStream","true");this.$195q=isc.Timer.setTimeout(function(){if(_1.$159v)return;_1.logDebug("EventSource connect timed out to: "+_4.uri+" - downgrading to next available protocol");_1.useEventSource=false;_1.$zs=null;_1.$189b();_1.$zw('downgrade from EventSource - initial timer')},this.connectTimeout,isc.Timer.MSEC);var _11=this.$zs.eventSource=new EventSource(_4.uri);_11.onerror=isc.Messaging.$1123||function(_19){isc.Timer.clearTimeout(_1.$195q);delete _1.$195q;_1.logDebug("EventSource error connecting to: "+_4.uri+": "+isc.echoFull(_19));if(_1.$195r){_1.logDebug("EventSource protocol known working - continuing to retry")}else{_1.logDebug("marking EventSource protocol unavailable - downgrading to next available protocol");_1.useEventSource=false;_1.$zs=null;_1.$189b();_1.$zw('downgrade from EventSource - onerror handler')}}
var _12=function eventListenerFun(_19){var _13=location.origin;if(_13==null){_13=location.protocol+"//"+location.host}
if(_19.origin==null||_19.origin!=_13){isc.Messaging.logWarn("'"+_19.type+"' event received with wrong origin: "+_19.origin+" (should be "+_13+")");return}
if(_10.$ie!=null){_1.$195r=true;_10.$ie.document.write("<SCRIPT>"+_19.data+"</SCRIPT>")}}
_11.addEventListener("connectCallback",_12,false);_11.addEventListener("keepalive",_12,false);_11.addEventListener("message",_12,false);_11.addEventListener("serverConnTerminate",_12,false)}else if(this.useAJAX()){this.logDebug("Using AJAX for comm");var _10=isc.HiddenFrame.create({useHtmlfile:isc.Browser.isIE});_10.$ic();var _14=this.$zs;_14.commFrame=_10;var _15=0;var _16=this.$1126=function(){if(_16!=isc.Messaging.$1126)return;var _17=_14.xmlHttpRequest;if(!_17)return;if(_17.readyState==3||_17.readyState==4||(isc.Browser.isOpera&&_17.readyState==2))
{var _18=_17.responseText.substring(_15);_15=_17.responseText.length;_10.$ie.document.write(_18)}};this.$zs.xmlHttpRequest=isc.Comm.sendXmlHttpRequest({URL:_4.uri,fields:_2,httpMethod:this.legacyCommHTTPMethod,transaction:{changed:function(){},requestData:_2},onreadystatechange:_16})}else{this.logDebug("Using HiddenFrame for comm");var _10=isc.HiddenFrame.create({useHtmlfile:isc.Browser.isIE});_10.$ic();this.$zs.commFrame=_10;isc.Comm.sendHiddenFrame({URL:_4.uri,fields:_2,httpMethod:this.legacyCommHTTPMethod,transaction:{changed:function(){},requestData:_2},frame:_10})}
this.$z4=isc.Timer.setTimeout("isc.Messaging.$z2()",this.connectTimeout,isc.Timer.MSEC)},isc.A._connectCallback=function isc_c_Messaging__connectCallback(_1,_2){if(this.$zs==null||this.$zs.connectionID!=_1){this.logDebug("Ignoring _connectCallback to old connectionID: "+_1);return}
this.$z5=_2.keepaliveInterval;this.$z6=_2.keepaliveReestablishDelay;this.$z7=this.$z5+this.$z6;this.$z8=_2.connectionTTL;this.connectTimeout=_2.connectTimeout;this.dispatcherImplementer=_2.dispatcherImplementer;this.useDurableTopics=_2.useDurableTopics;this.logDebug("connection "+_1+" established");this.$192m(this.$zr);this.$zr=this.$zs;this.$zs=null;isc.Timer.clear(this.$z4);this.$z4=null;this.$z9();this.$0a();this.logDebug("persistent server connection open - ttl: "+this.$z8+"ms, keepaliveDelay: "+this.$z7+"ms, connectTimeout: "+this.connectTimeout+"ms.")
if(this.$189a&&!this.$233i){this.$233i=true;return}
if(this.$z3){this.$z3=false;this.$zw('reconnectOnEstablish');return}
this.$189c();if(this.$195p()){if(this.$z8!=-1){var _3=this;isc.Timer.setTimeout(function(){_3.$zw('connectionTTL ('+this.$z8+'ms) expired')},this.$z8,isc.Timer.MSEC)}else{this.logDebug("websocket: server specifies no connection timeout")}}
for(var _4 in this._channels){var _5=this._channels[_4];if(_5.subscriptionCallback){this.fireCallback(_5.subscriptionCallback,null,null,null,true);delete _5.subscriptionCallback}}},isc.A.$189c=function isc_c_Messaging__connectionUp(){this.$159v=true;this.connectionUp()},isc.A.connectionUp=function isc_c_Messaging_connectionUp(){},isc.A.$189b=function isc_c_Messaging__connectionDown(){this.$159v=false;this.connectionDown()},isc.A.connectionDown=function isc_c_Messaging_connectionDown(){},isc.A.$z9=function isc_c_Messaging__resetStatusBar(){var _1=isc.Browser.isIE?"Done":"Stopped";isc.Timer.setTimeout("window.status='"+_1+"'",0)},isc.A.$1887=function isc_c_Messaging__sendKeepalive(){if(this.$zr&&this.$zr.webSocket){this.$zr.webSocket.send(isc.Comm.serialize({command:"keepalive"},false))}},isc.A._keepalive=function isc_c_Messaging__keepalive(_1){this.$z9();isc.Timer.clear(this.$1888);this.$1888=isc.Timer.setTimeout("isc.Messaging.$1887()",this.$z5-100,isc.Timer.MSEC);if(!this.$zr||this.$zr.connectionID!=_1)return;this.$0a();this.logDebug("keepalive on conn: "+_1)},isc.A.$0b=function isc_c_Messaging__keepaliveWatchdog(){this.logDebug("connection to server lost, re-establishing...");this.$zw("keepaliveWatchdog");this.$189b()},isc.A.$192l=function isc_c_Messaging__clearKeepaliveTimer(){isc.Timer.clear(this.$z0)},isc.A.$0a=function isc_c_Messaging__resetKeepaliveTimer(){this.$192l();this.$z0=isc.Timer.setTimeout("isc.Messaging.$0b()",this.$z7,isc.Timer.MSEC)},isc.A._message=function isc_c_Messaging__message(_1){if(isc.isA.String(_1))_1=isc.eval("var message = "+_1+";message;");var _2=_1.connectionID,_3=_1.channels,_4=_1.id,_5=_1.data;this.$z9();this.$0a();if(this.$zt.contains(_4)){this.logDebug("ignoring duplicate messageID: "+_4);return}
this.$zt.push(_4);if(this.$zt.length>this.$zu)this.$zt.shift();for(var i=0;i<_3.length;i++){var _7=_3[i];if(!this._channels[_7])continue;var _8=_7;var _7=this._channels[_7],_9=_7.callback
if(_9)this.fireCallback(_9,"data,channel",[_5,_8],_7,true)}},isc.A.$192m=function isc_c_Messaging__destroyConn(_1){if(!_1)return;this.logDebug("Destroying connection: "+_1.connectionID);if(_1.webSocket){try{_1.webSocket.close();_1.webSocket=null}catch(e){}}
if(_1.eventSource){try{_1.eventSource.close()}catch(e){}}
if(_1.xmlHttpRequest){try{_1.xmlHttpRequest.abort()}catch(e){}}
if(_1.commFrame){_1.commFrame.destroy()}},isc.A.$74q=function isc_c_Messaging__destroyConns(_1){if(!_1)_1={};this.$192m(this.$zr);delete this.$zr;this.$192m(this.$zs);delete this.$zs;if(_1.noConnectionDownCallback)return;this.$189b()});isc.B._maxIndex=isc.C+33;isc.Page.setEvent("unload",function(){isc.Messaging.$74q()});isc.defineClass("MessagingDMIDiscoveryDS","DataSource");isc.A=isc.MessagingDMIDiscoveryDS.getPrototype();isc.B=isc._allFuncs;isc.C=isc.B._maxIndex;isc.D=isc._funcClasses;isc.D[isc.C]=isc.A.Class;isc.A.clientOnly=true;isc.A.fields=[{name:"GUID",primaryKey:true},{name:"userAgent",title:"User Agent"},{name:"lastContact",title:"Last Contact",type:"datetime"}];isc.B.push(isc.A.init=function isc_MessagingDMIDiscoveryDS_init(){this.Super("init",arguments);this.cacheData=[];this.discover()},isc.A.invalidateCache=function isc_MessagingDMIDiscoveryDS_invalidateCache(){var _1=this;var _2=this.getCacheData();while(_2.length)_1.removeData(_2[0]);this.delayCall("discover")},isc.A.discover=function isc_MessagingDMIDiscoveryDS_discover(){var _1=this;if(!this.client){this.client=isc.MessagingDMIClient.create({socketProperties:{doNotTrackRPC:true,isRemoteDebug:this.isRemoteDebug}})}
this.client.call({sendChannel:this.discoverOnChannel,methodName:"discover",timeout:this.discoveryTimeout,callback:function(_2){_1.updateServer(_2)}})},isc.A.updateServer=function isc_MessagingDMIDiscoveryDS_updateServer(_1){_1.lastContact=new Date();var _2=this;this.fetchData({GUID:_1.GUID},function(_3){if(_3.data&&_3.data.getLength()==0){_2.addData(_1)}else{_2.updateData(_1)}})});isc.B._maxIndex=isc.C+4;isc._nonDebugModules=(isc._nonDebugModules!=null?isc._nonDebugModules:[]);isc._nonDebugModules.push('RealtimeMessaging');isc.checkForDebugAndNonDebugModules();isc._moduleEnd=isc._RealtimeMessaging_end=(isc.timestamp?isc.timestamp():new Date().getTime());if(isc.Log&&isc.Log.logIsInfoEnabled('loadTime'))isc.Log.logInfo('RealtimeMessaging module init time: '+(isc._moduleEnd-isc._moduleStart)+'ms','loadTime');delete isc.definingFramework;if(isc.Page)isc.Page.handleEvent(null,"moduleLoaded",{moduleName:'RealtimeMessaging',loadTime:(isc._moduleEnd-isc._moduleStart)});}else{if(window.isc&&isc.Log&&isc.Log.logWarn)isc.Log.logWarn("Duplicate load of module 'RealtimeMessaging'.");}/** RealtimeMessagingModule End **/

