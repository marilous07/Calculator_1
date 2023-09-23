/*

  SmartClient Ajax RIA system
  Version v13.0p_2023-09-15/EVAL Deployment (2023-09-15)

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

if(window.isc&&window.isc.module_Core&&!window.isc.module_Tools){isc.module_Tools=1;isc._moduleStart=isc._Tools_start=(isc.timestamp?isc.timestamp():new Date().getTime());if(isc._moduleEnd&&(!isc.Log||(isc.Log && isc.Log.logIsDebugEnabled('loadTime')))){isc._pTM={ message:'Tools load/parse time: ' + (isc._moduleStart-isc._moduleEnd) + 'ms', category:'loadTime'};
if(isc.Log && isc.Log.logDebug)isc.Log.logDebug(isc._pTM.message,'loadTime');
else if(isc._preLog)isc._preLog[isc._preLog.length]=isc._pTM;
else isc._preLog=[isc._pTM]}isc.definingFramework=true;isc.defineClass("ComponentEditor","PropertySheet");
isc.A=isc.ComponentEditor;
isc.A._formItemTypeToFormulaFieldMap={
        integer:"formula",
        float:"formula",
        sequence:"formula",
        date:"formula",
        time:"formula",
        text:"textFormula"
    };
isc.A._listGridFieldTypeToFormulaFieldMap={
        integer:"editorFormula",
        float:"editorFormula",
        sequence:"editorFormula",
        date:"editorFormula",
        time:"editorFormula",
        text:"editorTextFormula"
    };
isc.A._dynamicPropertyTypes=[
        "any",
        "Any",
        "string",
        "String",
        "HTMLString",
        "boolean",
        "Boolean",
        "number",
        "Number",
        "int",
        "integer",
        "Integer",
        "positiveInteger",
        "URL",
        "url"
    ]
;

isc.A=isc.ComponentEditor.getPrototype();
isc.A.immediateSave=false;
isc.A.itemHoverWidth=50;
isc.A.itemHoverAutoFitWidth=true;
isc.A.itemHoverAutoFitMaxWidth=500;
isc.A.titleHoverFocusKey="f2";
isc.A.showSuperClassEvents=true;
isc.A.initialGroups=5;
isc.A.showAttributes=true;
isc.A.showMethods=false;
isc.A.hasMethods=false;
isc.A.basicMode=false;
isc.A.useMixedModeForBasic=true;
isc.A.lessTitle="Less";
isc.A.moreTitle="More";
isc.A.emptyMethodsMessage="There are no events for this component";
isc.A.emptyBasicMethodsMessage="There are no common events for this component. To view advanced events click the \"More...\" button.";
isc.A.handPlacedFormFieldsHover="Form fields placed in a Hand-Placed Form do not show titles. Use individual Labels to add custom titles.";
isc.A.readOnlyRequiresDSHover="Add a DataSource to enable";
isc.A.readOnlyIfDataBoundHover="Data type for this field is determined by the component's DataSource and cannot be changed for only this component/field. Change the data type in the DataSource Editor instead";
isc.A.readOnlyIfOptionDataSourceHover="A DataSource is being used for values";
isc.A.canSwitchClass=false;
isc.A.componentTypeTitle="Component Type"
;

isc.A=isc.ComponentEditor.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.handlerFieldBase={
        validateOnChange:true,
        validators:[{type:"isFunction"}],
        showPopUpIcon:false,
        actionIconPosition:0,
        popUpOnAnyClick:false,
        itemHoverHTML:function(){
            var value=this._getDisplayValue(this.getValue());
            if(value==null)return value;
            value=String(value);
            if(value=="&nbsp;"||value.match(/^\W+$/))value="";
            return value.asHTML();
        }
    };
isc.A.itemHoverStyle="docHover";
isc.B.push(isc.A.shouldUseField=function isc_ComponentEditor_shouldUseField(field){
        if(!this.Super("shouldUseField",arguments)){
            return false;
        }
        if(field.hidden||field.inapplicable||field.advanced)return false;
        var localBasicMode=this._basicMode==null?this.basicMode:this._basicMode;
        if(localBasicMode&&!field.basic)return false;
        if(field.type&&isc.DS.isLoaded(field.type)&&
             field.type!="DataSource"&&field.type!="ValueMap"&&
             field.type!="Action"&&field.type!="AdvancedCriteria"&&
             field.type!="UserFormula"&&field.type!="UserSummary"&&
             field.type!="SummaryFunction"&&
             field.type!="ValuesManager"&&field.type!="Menu"&&
             field.type!="Validator")
        {
            return false;
        }
        var ds=isc.DS.get(this.dataSource);
        if(!ds)return true;
        var className=ds.ID,
            fieldName=field[this.fieldIdProperty];
        if(isc.jsdoc.hasData()){
            var docItem=isc.jsdoc.getDocItem(className,fieldName,true);
            if(field.visibility!=null&&docItem==null)return false;
            if(docItem&&isc.jsdoc.getAttribute(docItem,"deprecated"))return false;
            if(docItem&&isc.jsdoc.isAdvancedAttribute(docItem))return false;
        }
        return true;
    }
,isc.A._setItems=function isc_ComponentEditor__setItems(itemList,delayed){
        var pendingTimer=this._pendingBindToDataSource;
        if(pendingTimer){
            isc.Timer.clear(pendingTimer);
            delete this._pendingBindToDataSource;
        }
        if(!delayed)this._canonicalizeItems(itemList);
        if(isc.jsdoc.hasData())
        {
            this.clearJsDocLoadingPrompt();
            if(delayed){
                this._expandInitialGroupsTimerId=this.delayCall("expandInitialGroups");
            }
            this.invokeSuper(isc.ComponentEditor,"_setItems",itemList);
            if(this._pendingEditComponent){
                this.delayCall("editComponent",this._pendingEditComponent);
                delete this._pendingEditComponent;
            }
        }else{
            this.showJsDocLoadingPrompt();
            this._pendingBindToDataSource=this.delayCall("_setItems",[itemList,true],200);
            this.items=[];
        }
    }
,isc.A.showJsDocLoadingPrompt=function isc_ComponentEditor_showJsDocLoadingPrompt(){
        if(this._loadingLabel)return;
        var imgHTML=this.imgHTML(isc.Canvas.loadingImageSrc,
                                   isc.Canvas.loadingImageSize,
                                   isc.Canvas.loadingImageSize)
        ;
        this._loadingLabel=isc.Label.create({
            align:"center",autoDraw:false,
            width:"100%",height:"100%",
            contents:imgHTML+"&nbsp;Loading SmartClient Reference..."
        });
        this.addChild(this._loadingLabel);
    }
,isc.A.clearJsDocLoadingPrompt=function isc_ComponentEditor_clearJsDocLoadingPrompt(){
        if(this._loadingLabel){
            this.removeChild(this._loadingLabel);
            delete this._loadingLabel;
        }
    }
,isc.A.bindToDataSource=function isc_ComponentEditor_bindToDataSource(fields,componentIsDetail){
        var boundFields=this._boundFields=this.Super("bindToDataSource",arguments);
        var ds=this.dataSource?isc.DS.get(this.dataSource):null;
        if(fields&&fields.length>0)return boundFields;
        if(ds==null||this._boundFields==null)return boundFields;
        for(var i=0;i<boundFields.length;i++){
            var field=boundFields[i],
                defaultValue=field.defaultValue;
            if(defaultValue==null)continue;
            if(defaultValue=="false")defaultValue=false;
            else if(defaultValue=="true")defaultValue=true;
            else if(parseInt(defaultValue).toString()==defaultValue){
                defaultValue=parseInt(defaultValue);
            }
            field.defaultValue=defaultValue;
        }
        if(!isc.jsdoc.hasData())return boundFields;
        var groups={},createGroups=false;
        if(this.showAttributes){
            for(var i=0;i<boundFields.length;i++){
                var field=boundFields[i],
                    name=field[this.fieldIdProperty]
                ;
                var groupName=field.group||isc.jsdoc.getGroupForAttribute(ds.ID,name)||
                                    "other";
                if(groupName==null)groupName="other";
                if(groupName!="other")createGroups=true;
                if(!groups[groupName])groups[groupName]=[];
                groups[groupName].add(field);
            }
        }
        if(this.showMethods){
            if(!this.createMethodGroups(groups,ds)&&!this.showAttributes){
                this.showEmptyMethodsLabel();
                return[];
            }else{
                this.hideEmptyMethodsLabel();
                createGroups=true;
            }
        }
        if(!createGroups){
            if(this.sortFields)boundFields.sortByProperty("name",Array.ASCENDING);
            return boundFields;
        }
        var groupNames=isc.getKeys(groups),
            dsGroupOrder=ds.getGroups(),
            groupOrder=[];
        if(dsGroupOrder!=null){
            for(var i=0;i<dsGroupOrder.length;i++){
                var index=groupNames.indexOf(dsGroupOrder[i]);
                if(index==-1)continue;
                groupNames.removeAt(index);
                groupOrder.add(dsGroupOrder[i]);
            }
            groupOrder.addList(groupNames);
        }else{
            groupOrder=groupNames;
        }
        var index=groupOrder.indexOf("other");
        if(index!=-1){
            groupOrder.removeAt(index);
            groupOrder.add("other");
        }
        fields=[];
        if(this.canSwitchClass){
            var switcherConfig=this.getClassSwitcher();
            if(switcherConfig)fields[0]=switcherConfig;
        }
        if(this.creator.shouldShowDataPathFields&&this.creator.shouldShowDataPathFields()){
            fields[fields.length]=this.getDataPathField(true);
        }
        for(var i=0;i<groupOrder.length;i++){
            var groupName=groupOrder[i],
                group=groups[groupName],
                groupItem=this.getJSDocGroupItem(groupName),
                title=groupItem&&groupItem.title?groupItem.title:
                        isc.DataSource.getAutoTitle(groupName);
            if(this.sortFields)group.sortByProperty("name",Array.ASCENDING);
            fields[fields.length]=
                {
                    name:"group_"+groupName,
                    editorType:"TSectionItem",
                    defaultValue:title,
                    sectionExpanded:false,
                    items:group,
                    hoverFocusKey:"f2",
                    canvasProperties:{
                        hoverAutoFitWidth:this.itemHoverAutoFitWidth,
                        hoverAutoFitMaxWidth:this.itemHoverAutoFitMaxWidth,
                        hoverStyle:this.itemHoverStyle,
                        canHover:true,
                        groupName:groupName,
                        editor:this,
                        getHoverHTML:function(){
                            if(this.groupName){
                                var html=this.editor.getJSDocHoverHTML(this.groupName,null,null,["refs"]);
                                return html;
                            }
                            return null;
                        }
                    }
                };
        }
        return fields;
    }
,isc.A.getJSDocGroupItem=function isc_ComponentEditor_getJSDocGroupItem(groupName){
        var groupItem=isc.jsdoc.getGroupItem(groupName);
        if(groupName=="dataContext"){
            if(!this._dataContextItem){
                this._dataContextItem=groupItem=isc.addProperties({},groupItem);
                groupItem.title="Screen Inputs";
                groupItem.description="<i>Screen Inputs</i> are data values that are expected "+
                    "to be provided from outside your screen.<P>"+
                    "For example, if your screen is used as an <i>Expansion Screen</i> that is "+
                    "shown when records are expanded in a <i>ListGrid</i>, your screen gets the "+
                    "record being expanded as <i>screen inputs</i>.<P>"+
                    "If your screen is meant to be just part of an app built outside Reify, "+
                    "that app might pass you <i>screen inputs</i> such as a specific DataSource "+
                    "record that your screen is meant to display or edit.<P>"+
                    "From various places including form fields, you can click the screen inputs "+
                    "icon (<img src='graphics/actions/editScreenInputs.png' width='16' height='16'/>) "+
                    "to define test values that are used as <i>screen inputs</i> any time your "+
                    "screen is run on its own, without the surrounding app.";
            }else{
                groupItem=this._dataContextItem;
            }
        }
        return groupItem;
    }
,isc.A.getJSDocHoverHTML=function isc_ComponentEditor_getJSDocHoverHTML(container,item,linkName,omitAttrs){
        if(container=="dataContext"){
            var groupItem=this.getJSDocGroupItem(container);
            if(omitAttrs!=null&&omitAttrs.length>0){
                groupItem=isc.addProperties({},groupItem);
                for(var i=0;i<omitAttrs.length;i++){
                    delete groupItem[omitAttrs[i]];
                }
            }
            return isc.GroupViewer.hoverHTML(isc.jsdoc.toJS(groupItem),linkName);
        }
        return isc.jsdoc.hoverHTML(container,item,linkName,omitAttrs);
    }
,isc.A.showEmptyMethodsLabel=function isc_ComponentEditor_showEmptyMethodsLabel(){
        if(this._emptyMethodsLabel)return;
        var message=(this.hasMethods?this.emptyBasicMethodsMessage:this.emptyMethodsMessage);
        this._emptyMethodsLabel=isc.Label.create({
            align:"center",autoDraw:false,
            width:"100%",
            padding:20,
            contents:message
        });
        this.addChild(this._emptyMethodsLabel);
    }
,isc.A.hideEmptyMethodsLabel=function isc_ComponentEditor_hideEmptyMethodsLabel(){
        if(this._emptyMethodsLabel){
            this.removeChild(this._emptyMethodsLabel);
            delete this._emptyMethodsLabel;
        }
    }
,isc.A.addField=function isc_ComponentEditor_addField(field,index){
        if(this.fields)this.fields.addAt(field,index);
    }
,isc.A.getDataPathField=function isc_ComponentEditor_getDataPathField(isInput){
        var creator=this.creator,
            grid=creator.operationsPalette,
            initData=grid?grid.data:null,
            data=creator.trimOperationsTreeData(initData,isInput)
        ;
        return{
            name:isInput?"inputDataPath":"dataPath",
            title:isInput?"Input DataPath":"DataPath",
            isInput:isInput,
            type:"DataPathItem",
            operationsPalette:grid,
            operationsTreeData:data
        };
    }
,isc.A.getClassSwitcher=function isc_ComponentEditor_getClassSwitcher(){
        var dataSource=isc.DS.get(this.dataSource),
            classObj=isc.ClassFactory.getClass(dataSource.ID);
        if(!classObj)return null;
        return{
            name:"classSwitcher",
            title:this.componentTypeTitle,
            defaultValue:classObj.getClassName(),
            type:"select",
            valueMap:this.getClassSwitcherValueMap(dataSource,classObj)
        };
    }
,isc.A.getClassSwitcherValueMap=function isc_ComponentEditor_getClassSwitcherValueMap(dataSource,classObj){
        var chain,
            valueMap=[];
        if(classObj)chain=this.getInheritanceChain(classObj,dataSource);
        if(!chain)return null;
        for(var i=0;i<chain.length;i++){
            var schema=isc.DS.getNearestSchema(chain[i].getClassName()),
                subs=schema.substituteClasses;
                if(schema.createStandalone!=false){
                    if(!valueMap.contains(chain[i].getClassName())){
                        valueMap.add(chain[i].getClassName());
                    }
                }
            if(!subs)continue;
            var subsArray=subs.split(",");
             for(var i=0;i<subsArray.length;i++){
                subsArray[i]=subsArray[i].trim();
                if(!valueMap.contains(subsArray[i]))valueMap.add(subsArray[i]);
            }
        }
        valueMap.sort();
        return valueMap;
    }
,isc.A.createMethodGroups=function isc_ComponentEditor_createMethodGroups(groups,dataSource){
        var classObj=isc.ClassFactory.getClass(dataSource.ID);
        this._editableMethodFields=[];
        var localBasicMode=this._basicMode==null?this.basicMode:this._basicMode;
        var mixedMode=this.useMixedModeForBasic&&localBasicMode;
        if(mixedMode)localBasicMode=false;
        this.hasMethods=false;
        if(classObj&&classObj._stringMethodRegistry&&
            !isc.isAn.emptyObject(classObj._stringMethodRegistry))
        {
            var chain=this.getInheritanceChain(classObj,dataSource),
                classMethods,
                superclassMethods=[],
                newMethods,
                methodGroups={}
            ;
            if(chain.length==0&&mixedMode){
                chain.add(classObj);
            }
            for(var i=0;i<chain.length;i++){
                var currentClassObj=chain[i];
                var entries=currentClassObj._stringMethodRegistry._entries;
                classMethods=(entries?entries.duplicate():[]);
                newMethods=classMethods.duplicate();
                newMethods.removeList(superclassMethods);
                superclassMethods=classMethods;
                if(newMethods.length==0)continue;
                this.hasMethods=true;
                var defaultGroupName=
                    (currentClassObj==isc.Canvas?"Basic":currentClassObj.getClassName())
                    +" Methods";
                methodGroups[defaultGroupName]=[];
                for(var j=0;j<newMethods.length;j++){
                    var methodName=newMethods[j];
                    var docRef="method:"+currentClassObj.getClassName()+"."+methodName,
                        docItem=isc.jsdoc.getDocItem(docRef);
                    if(!docItem){
                        if(!dataSource.methods||!dataSource.methods.find("name",methodName)){
                            superclassMethods.remove(methodName);
                            continue;
                        }
                    }
                    if(docItem&&isc.jsdoc.getAttribute(docItem,"deprecated"))continue;
                    var groupName=defaultGroupName,
                        whenRuleTip
                    ;
                    if(mixedMode){
                        var method=dataSource.methods&&dataSource.methods.find("name",methodName),
                            component=this.currentComponent,
                            action=component.defaults&&component.defaults[methodName],
                            basicMethod=method&&method.basic
                        ;
                        if((!basicMethod||method.action)&&action==null)continue;
                        if(basicMethod){
                            groupName="Basic Methods";
                            if(!methodGroups[groupName])methodGroups[groupName]=[];
                            whenRuleTip=method.whenRuleTip;
                        }
                    }
                    var field=this.getMethodField(newMethods[j],method&&method.title);
                    methodGroups[groupName].add(field);
                    if(whenRuleTip)field.whenRuleTip=whenRuleTip;
                }
                if(methodGroups[defaultGroupName].length==0){
                    delete methodGroups[defaultGroupName];
                    delete groups[defaultGroupName];
                }
            }
            if(!localBasicMode){
                var methodGroupsNames=isc.getKeys(methodGroups).reverse();
                for(var i=0;i<methodGroupsNames.length;i++){
                    groups[methodGroupsNames[i]]=methodGroups[methodGroupsNames[i]];
                }
                return true;
            }
        }
        if(dataSource.methods&&dataSource.methods.length>0){
            var methodFields=groups[dataSource.ID+localBasicMode?
                                                            " Basic":""+" Methods"]=[];
            for(var i=0;i<dataSource.methods.length;i++){
                var method=dataSource.methods[i];
                if((localBasicMode&&!method.basic)||method.action)continue;
                var field=this.getMethodField(method.name,method.title);
                if(localBasicMode&&method.whenRuleTip)field.whenRuleTip=method.whenRuleTip;
                methodFields.add(field);
            }
            this.hasMethods=true;
            return true;
        }
        return false;
    }
,isc.A.getInheritanceChain=function isc_ComponentEditor_getInheritanceChain(classObj,dataSource){
        var chain=[],
            showSuper=this._firstNonNull(dataSource.showSuperClassEvents,
                                           this.showSuperClassEvents);
        if(showSuper&&
            (classObj.isA("Canvas")||classObj.isA("FormItem"))){
            for(var currentClassObj=classObj;
                 currentClassObj!=isc.Class;
                 currentClassObj=currentClassObj.getSuperClass())
            {
                chain.add(currentClassObj);
            }
        }
        chain.reverse();
        return chain;
    }
,isc.A.getMethodField=function isc_ComponentEditor_getMethodField(methodName,title){
        var field=isc.clone(this.handlerFieldBase);
        field[this.fieldIdProperty]=methodName;
        field.title=title||isc.DS.getAutoTitle(methodName);
        field.type=this.canEditExpressions?"expression":"action";
        this._editableMethodFields.add(field);
        return field;
    }
,isc.A.clearComponent=function isc_ComponentEditor_clearComponent(){
        var comp=this.currentComponent;
        if(comp==null)return;
        delete this.currentComponent;
        delete this.dataSource;
        this.setFields([]);
    }
,isc.A.editComponent=function isc_ComponentEditor_editComponent(component,liveObject,forceRefresh){
        if(!isc.jsdoc.hasData()){
            this._pendingEditComponent=[component,liveObject];
            return;
        }
        this._changingComponent=true;
        var type=isc.DS.getNearestSchema(component.type),
            liveObject=liveObject||component.liveObject;
        if(liveObject.useCustomSchema)type=liveObject.useCustomSchema;
        var componentChanged=(!this.currentComponent||this.currentComponent.ID!=component.ID);
        this.currentComponent=component;
        if(this.logIsInfoEnabled("editing")){
            this.logInfo("Editing component of type: "+type+
                         ", defaults: "+this.echo(component.defaults)+
                         ", liveObject: "+this.echoLeaf(liveObject),"editing");
        }
        var basicModeChanged=(!this.currentComponent||this._basicMode!=this._previousBasicMode);
        this._previousBasicMode=this._basicMode;
        if(!forceRefresh&&!componentChanged&&!basicModeChanged){
            this.setEditorValues(component,liveObject);
            delete this._changingComponent;
            return;
        }
        delete this._boundFields;
        this.setDataSource(type);
        var editableFields=this.getEditableFields();
        var editProperties=(!liveObject||!liveObject.getEditableProperties)
                    ?component.defaults:liveObject.getEditableProperties(editableFields);
        var undef;
        if(liveObject.editingOn&&liveObject._saveDisabled!=undef){
            editProperties.disabled=liveObject._saveDisabled;
        }
        var hideFields=["formula","textFormula","editorFormula","editorTextFormula"];
        if(isc.isA.FormItem(liveObject)||this.inheritsFrom(type,"ListGridField")){
            var isListGridField=this.inheritsFrom(type,"ListGridField"),
                fieldType=liveObject.type||liveObject.defaultType||"text";
            if(fieldType=="text"&&isc.isA.TimeItem(liveObject))fieldType="date";
            var applicableFormulaField=(isListGridField
                        ?isc.ComponentEditor._listGridFieldTypeToFormulaFieldMap[fieldType]
                        :isc.ComponentEditor._formItemTypeToFormulaFieldMap[fieldType])
            ;
            if(applicableFormulaField){
                hideFields.remove(applicableFormulaField);
            }
        }
        for(var i=0;i<editableFields.length;i++){
            var item=editableFields[i];
            if(item.advanced){
                item.showIf=this._falseFunc;
            }
            if(!item.name)continue;
            if(hideFields.contains(item.name)){
                item.showIf=this._falseFunc;
            }
            if(this.iconHoverStyle)item.iconHoverStyle=this.iconHoverStyle;
            if(item.width==null)item.width="*";
            if(this.builder&&item.type=="AdvancedCriteria"){
                item.targetRuleScope=this.builder.getScreenRuleScopeComponent();
                item.createRuleCriteria=item.isRuleCriteria;
                if(item.isRuleCriteria){
                    var attr=item.title.replace(" When","").toLowerCase();
                    if(attr=='enable')attr='enabled';
                    item.editorWindowProperties={
                        title:"Define when '"+component.name+"' is "+attr
                    };
                    item.iconPrompt="Edit form rule";
                }
                item.excludeAuthFromRuleScope=!this.builder.showUsersAndRoles;
            }else if(this.builder&&item.useRuleScope){
                item.targetRuleScope=this.builder.getScreenRuleScopeComponent();
            }
            if((item.type=="UserFormula"||item.type=="UserSummary")&&this.currentComponent.parentId){
                item.component=window[this.currentComponent.parentId];
            }
            if(isc.ComponentEditor._dynamicPropertyTypes.contains(item.type)){
                item.targetRuleScope=this.builder.getScreenRuleScopeComponent();
                item.editorWindowProperties={
                    title:"Define Dynamic Property for field '"+item.name+"'"
                };
                if(item.type.toLowerCase()=="boolean"){
                    item.createRuleCriteria=true;
                }
                if(this.currentComponent.parentId){
                    item.component=window[this.currentComponent.parentId];
                    if(isc.isA.FormItem(liveObject)){
                        item.simplifyComponentPaths=false;
                    }
                }
            }
            if(item.requiresDSField){
                item.readOnlyWhen={
                    _constructor:"AdvancedCriteria",
                    operator:"and",
                    criteria:[
                        {fieldName:this.getLocalId()+".values."+item.requiresDSField,operator:"isNull"}
                    ]
                };
                item.readOnlyHover=this.readOnlyRequiresDSHover;
            }else if(item.readOnlyIfDataBound=="true"){
                var form=liveObject.form;
                if(form&&form.dataSource&&form.getDataSource().getField(component.name)!=null){
                    item.readOnlyWhen={
                        _constructor:"AdvancedCriteria",
                        operator:"and",
                        criteria:[
                            {fieldName:this.getLocalId()+".values._parentDataSource",operator:"notNull"}
                        ]
                    };
                    item.readOnlyDisplay="disabled";
                    item.disabledHover=this.readOnlyIfDataBoundHover;
                }
            }else if(item.readOnlyIfOptionDataSource=="true"){
                if(liveObject.form){
                    item.readOnlyWhen={
                        _constructor:"AdvancedCriteria",
                        operator:"and",
                        criteria:[
                            {fieldName:this.getLocalId()+".values.optionDataSource",operator:"notNull"}
                        ]
                    };
                    item.readOnlyHover=this.readOnlyIfOptionDataSourceHover;
                }
            }else if(item.readOnlyInLayout=="true"){
                if(isc.isA.Layout(liveObject.parentElement)){
                    item.canEdit=false;
                }
            }
            if(item.type=="color"){
                item.defaultPickerMode="complex";
            }
            if(item.name=="title"&&isc.isA.FormItem(liveObject)&&liveObject.form&&
                liveObject.form.itemLayout=="absolute")
            {
                item.disabled=true;
                item.prompt=this.handPlacedFormFieldsHover;
            }
        }
        this._expandInitialGroupsTimerId=this.delayCall("expandInitialGroups");
        this.setEditorValues(component,liveObject);
        delete this._changingComponent;
    }
,isc.A.getEditableFields=function isc_ComponentEditor_getEditableFields(){
        var editableFields=this._boundFields;
        if(this._editableMethodFields){
            editableFields=editableFields.concat(this._editableMethodFields);
        }
        return editableFields;
    }
,isc.A.setEditorValues=function isc_ComponentEditor_setEditorValues(component,liveObject){
        var values={},
            editableFields=this.getEditableFields()
        ;
        var editProperties=(!liveObject||!liveObject.getEditableProperties)
                    ?component.defaults:liveObject.getEditableProperties(editableFields);
        var parentDataSource=null;
        for(var i=0;i<editableFields.length;i++){
            var item=editableFields[i];
            if(item.readOnlyIfDataBound=="true"){
                if(liveObject.form){
                    parentDataSource=liveObject.form.dataSource;
                }
            }
            var propertyName=item.name,
                value=editProperties[propertyName];
            var undef;
            if(value===undef)continue;
            if(isc.isA.Function(value)){
                if(!liveObject.getClass)continue;
                var baseImpl=liveObject.getClass().getInstanceProperty(propertyName);
                if(baseImpl==value)continue;
            }
            if(item.type=="identifier"&&isc.isAn.Object(value)){
                value=(value.getLocalId?value.getLocalId():
                            (value.getID?value.getID():value.ID));
            }
            values[propertyName]=value;
        }
        if(liveObject.dataSource&&isc.DS.get(liveObject.dataSource)!=null){
            values.dataSource=(isc.isA.DataSource(liveObject.dataSource)
                ?liveObject.dataSource.ID:liveObject.dataSource);
        }
        if(liveObject.optionDataSource&&isc.DS.get(liveObject.optionDataSource)!=null){
            values.optionDataSource=(isc.isA.DataSource(liveObject.optionDataSource)
                ?liveObject.optionDataSource.ID:liveObject.optionDataSource);
        }
        if(this.logIsDebugEnabled("editing")){
            this.logDebug("Live values: "+this.echo(values),"editing");
        }
        this.setValues(values);
        for(var propertyName in values){
            if(isc.isA.Function(values[propertyName])||
                isc.isA.StringMethod(values[propertyName])||
                isc.isA.ValuesManager(values[propertyName]))
            {
                this.setValue(propertyName,values[propertyName]);
            }
        }
        if(parentDataSource){
            if(isc.isA.DataSource(parentDataSource))parentDataSource=parentDataSource.ID;
            this.setValue("_parentDataSource",parentDataSource);
        }
        if(component.defaults.dataPath&&this.getItem("dataPath")){
            this.getItem("dataPath").setDataPathProperties(component);
        }
        if(component.defaults.inputDataPath&&this.getItem("inputDataPath")){
            this.getItem("inputDataPath").setDataPathProperties(component);
        }
    }
,isc.A.getViewState=function isc_ComponentEditor_getViewState(){
        var state={
            groups:{},
            position:[this.getScrollLeft(),this.getScrollTop()],
            basicMode:this._basicMode
        };
        var fields=this.items,
            groups=state.groups
        ;
        for(var i=0;i<fields.length;i++){
            var field=fields[i];
            if(field.editorType=="TSectionItem"){
                groups[field.name]=field.isExpanded();
            }
        }
        return state;
    }
,isc.A.setViewState=function isc_ComponentEditor_setViewState(state){
        if(!state)return;
        var groups=state.groups;
        for(var key in groups){
            var field=this.getField(key);
            if(field){
                if(groups[key]&&!field.isExpanded()){
                    field.expandSection();
                }else if(field.isExpanded()){
                    field.collapseSection();
                }
            }
        }
        if(this._expandInitialGroupsTimerId){
            isc.Timer.clear(this._expandInitialGroupsTimerId);
            delete this._expandInitialGroupsTimerId;
        }
        var position=state.position;
        if(position&&(position[0]!=this.getScrollLeft()||position[1]!=this.getScrollTop())){
            var _editor=this;
            isc.Timer.setTimeout(function(){
                _editor.scrollTo(position[0],position[1]);
            })
        }
    }
,isc.A._falseFunc=function isc_ComponentEditor__falseFunc(){

        return false;
    }
,isc.A.expandInitialGroups=function isc_ComponentEditor_expandInitialGroups(){
        var groupCount=0;
        for(var i=0;i<this.items.length;i++){
            var item=this.items[i];
            if(item.sectionExpanded!=null&&groupCount++<this.initialGroups){
                item.expandSection();
            }
        }
    }
,isc.A.wrapEditorColumns=function isc_ComponentEditor_wrapEditorColumns(){
        if(!this.items)return;
        var visibleCount=0;
        for(var i=0;i<this.items.length;i++){
            var item=this.items[i];
            if(item.visible&&!item.advanced)visibleCount++;
        }
        if(visibleCount>10)this.numCols=4;
        if(visibleCount>20)this.numCols=6;
    }
,isc.A.titleHoverHTML=function isc_ComponentEditor_titleHoverHTML(item){
        if(isc.jsdoc.hasData()){
            var html=isc.jsdoc.hoverHTML(isc.DataSource.get(this.dataSource).ID,item.name,
                 null,
                 ["getter","setter","examples"]
            );
            if(!html){
                if(this.showMethods){
                    var method=isc.jsdoc.docItemForDSMethod(this.dataSource,item.name);
                    if(method)html=isc.MethodFormatter.hoverHTML(method);
                }else{
                    var field=isc.jsdoc.docItemForDSField(this.dataSource,item.name);
                    if(field)html=isc.AttrFormatter.hoverHTML(field);
                }
            }
            if(html)return html;
        }
        return"<nobr><code><b>"+item.name+"</b></code> (no doc available)</nobr>";
    }
,isc.A.getEditorType=function isc_ComponentEditor_getEditorType(item){
        var result;
        if(item&&item.type=="ValueMap")result="ValueMapItem";
        else if(item&&item.type=="AdvancedCriteria")result="CriteriaItem";
        else if(item&&item.type=="UserFormula"){
            var componentType=isc.DS.getNearestSchema(this.currentComponent.type);
            if(this.inheritsFrom(componentType,"ListGridField")){
                result="FormulaEditorItem";
            }else if(!this.inheritsFrom(componentType,"TextItem")&&
                !this.inheritsFrom(componentType,"IntegerItem")&&
                !this.inheritsFrom(componentType,"FloatItem"))
            {
                result="ExpressionEditorItem";
            }else{
                result=(isc.isA.DateItem(this.currentComponent.liveObject)?
                    "ExpressionEditorItem":"FormulaEditorItem");
            }
        }
        else if(item&&item.type=="UserSummary")result="SummaryEditorItem";
        else if(item&&item.type=="Menu")result="MenuChooserItem";
        if(result){
            var toolType="T"+result;
            if(isc[toolType]!=null&&isc.isA.FormItem(isc[toolType]))return toolType;
            return result;
        }
        if(this.allowDynamicProperties&&
                item.type&&isc.ComponentEditor._dynamicPropertyTypes.contains(item.type)&&
                item.allowDynamicProperties!=false&&item.allowDynamicProperties!="false")
        {
            var componentType=isc.DS.getNearestSchema(this.currentComponent.type);
            if(!this.inheritsFrom(componentType,"ListGridField")){
                var ds=isc.DS.get(this.dataSource);
                if(ds&&isc.jsdoc.hasData()){
                    var className=ds.ID,
                        fieldName=item[this.fieldIdProperty]
                    ;
                    var docItem=isc.jsdoc.getDocItem(className,fieldName,true);
                    var flags=docItem?
                        (docItem.getAttribute?docItem.getAttribute("flags"):docItem.flags):null;
                    if(flags&&flags.contains("W")){
                        var valueType=docItem.getAttribute?docItem.getAttribute("valueType"):docItem.valueType;
                        var types=valueType.split(/[ \t]*[|]+[ \t]*/);
                        for(var i=0;i<types.length;i++){
                            var type=types[i];
                            if(isc.ComponentEditor._dynamicPropertyTypes.contains(type)){
                                var result=type.toLowerCase()=="boolean"?
                                    "CheckboxDynamicPropertyItem":"DynamicPropertyEditorItem";
                                var toolType="T"+result;
                                if(isc[toolType]!=null&&isc.isA.FormItem(isc[toolType]))return toolType;
                                return result;
                            }
                        }
                    }
                }
            }
        }
        var baseType=this.Super("getEditorType",arguments);
        if(isc.FormItemFactory.getItemClass(baseType)==null){
            this.logWarn("Cannot find item class for "+baseType+" of field "+item.name+" in component type "+this.currentComponent.type);
        }
        baseType=isc.FormItemFactory.getItemClass(baseType).getClassName();
        var toolType="T"+baseType;
        if(isc[toolType]!=null&&isc.isA.FormItem(isc[toolType]))return toolType;
        return baseType;
    }
,isc.A.inheritsFrom=function isc_ComponentEditor_inheritsFrom(type,otherType){
        if(otherType==null){
            this.logWarn("inheritsFrom passed null type");
            return false;
        }
        if(isc.isA.String(type))type=isc.DS.get(type);
        if(type==null)return false;
        if(type.name==otherType)return true;
        while(type.inheritsFrom){
            var parentType=isc.DS.get(type.inheritsFrom);
            if(parentType==null)return null;
            if(parentType.name==otherType)return true;
            type=parentType;
        }
        return false;
    }
);
isc.B._maxIndex=isc.C+28;

isc.defineClass("Wizard","VLayout");
isc.A=isc.Wizard.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.stepInstructionsDefaults={
        _constructor:"Label",
        contents:"Instructions",
        padding:10,
        height:20
    };
isc.A.stepPaneDefaults={
        _constructor:"VLayout",
        padding:10
    };
isc.A.showStepIndicator=false;
isc.A.stepIndicatorDefaults={
        _constructor:"HLayout",
        height:22,
        layoutMargin:0,
        layoutLeftMargin:10,
        membersMargin:2
    };
isc.A.stepIndicatorItems=[];
isc.A.stepButtonDefaults={
        _constructor:"Img",
        layoutAlign:"center",
        showRollOver:false,
        height:18,
        width:18
    };
isc.A.stepSeparatorDefaults={
        _constructor:"Img",
        layoutAlign:"center",
        height:16,
        width:16,
        src:"[SKIN]/TreeGrid/opener_closed.gif"
    };
isc.A.navButtonsDefaults={
        _constructor:"ToolStrip",
        height:22,
        layoutMargin:5,
        membersMargin:10
    };
isc.A.navButtonsItems=["previousButton","nextButton","finishButton","cancelButton"];
isc.A.previousButtonDefaults={
        _constructor:"Button",
        layoutAlign:"center",
        title:"Previous",
        click:"this.creator.previousStep()",
        visibility:"hidden"
    };
isc.A.nextButtonDefaults={
        _constructor:"Button",
        layoutAlign:"center",
        title:"Next",
        click:"this.creator.nextStep()"
    };
isc.A.finishButtonDefaults={
        _constructor:"Button",
        layoutAlign:"center",
        title:"Finish",
        click:"this.creator.finished()",
        visibility:"hidden"
    };
isc.A.cancelButtonDefaults={
        _constructor:"Button",
        layoutAlign:"center",
        title:"Cancel",
        click:"this.creator.cancel()"
    };
isc.A.autoChildParentMap={
        nextButton:"navButtons",
        previousButton:"navButtons",
        finishButton:"navButtons"
    };
isc.A._$stepButton="_stepButton_";
isc.B.push(isc.A.initWidget=function isc_Wizard_initWidget(){
        this.Super(this._$initWidget,arguments);
        this.createSteps();
        this.addAutoChild("stepInstructions");
        this.addAutoChild("stepPane");
        this.addAutoChild("navButtons");
        this.addAutoChildren(this.navButtonsItems,this.navButtons);
        if(this.showStepIndicator){
            this.addAutoChild("stepIndicator");
            for(var i=0;i<this.steps.length;i++){
                var stepName=this.steps[i].stepName,
                    stepButtonProperties={src:stepName}
                ;
                var stepButton=this.createAutoChild("stepButton",stepButtonProperties);
                this.stepIndicator.addMember(stepButton);
                this.steps[i]._stepButton=stepButton;
                if(i+1<this.steps.length){
                    this.stepIndicator.addMember(this.createAutoChild("stepSeparator"));
                }
            }
            this.navButtons.addMember(this.stepIndicator,0);
        }
        this.goToStep(0,true);
    }
,isc.A.draw=function isc_Wizard_draw(showing){
        var returnValue=this.Super("draw",arguments);
        this.updateButtons();
        return returnValue;
    }
,isc.A.createSteps=function isc_Wizard_createSteps(steps){
        if(!steps)steps=this.steps;
        if(!steps)return;
        if(!isc.isAn.Array(steps))steps=[steps];
        for(var i=0;i<steps.length;i++){
            steps[i]=isc.WizardStep.create(steps[i],{wizard:this});
        }
    }
,isc.A.getStep=function isc_Wizard_getStep(stepId){return isc.Class.getArrayItem(stepId,this.steps)}
,isc.A.getCurrentStep=function isc_Wizard_getCurrentStep(){return this.getStep(this.currentStepNum);}
,isc.A.getCurrentStepIndex=function isc_Wizard_getCurrentStepIndex(){return this.currentStepNum;}
,isc.A.getStepIndex=function isc_Wizard_getStepIndex(stepId){return isc.Class.getArrayItemIndex(stepId,this.steps)}
,isc.A.getStepPane=function isc_Wizard_getStepPane(stepId){
        return this.getStep(stepId).pane;
    }
,isc.A.goToStep=function isc_Wizard_goToStep(stepId,firstStep){
        if(!firstStep){
            if(!this.getCurrentStep().exitStep(stepId))return;
            this.getStepPane(this.currentStepNum).hide();
        }
        var step=this.getStep(stepId);
        step.enterStep(this.currentStepNum);
        this.currentStepNum=this.getStepIndex(step);
        var pane=this.getStepPane(stepId);
        if(step.instructions)this.stepInstructions.setContents(step.instructions);
        else this.stepInstructions.hide();
        this.stepPane.addMember(pane,0);
        pane.show();
        this.updateButtons();
    }
,isc.A.go=function isc_Wizard_go(direction){
        var index=this.getStepIndex(this.currentStepNum);
        index+=direction;
        this.goToStep(this.getStep(index));
    }
,isc.A.nextStep=function isc_Wizard_nextStep(){
        var currentStep=this.getStep(this.currentStepNum);
        if(currentStep.hasNextStep())this.goToStep(currentStep.getNextStep());
        else this.go(1);
    }
,isc.A.previousStep=function isc_Wizard_previousStep(){
        var currentStep=this.getStep(this.currentStepNum);
        if(currentStep.hasPreviousStep())this.goToStep(currentStep.getPreviousStep());
        else this.go(-1);
    }
,isc.A.finished=function isc_Wizard_finished(){
        this.resetWizard();
    }
,isc.A.cancel=function isc_Wizard_cancel(){
        this.resetWizard();
    }
,isc.A.updateButtons=function isc_Wizard_updateButtons(){
        var stepNum=this.getStepIndex(this.currentStepNum),
            step=this.getCurrentStep()
        ;
        if(this.stepIndicator){
            for(var i=0;i<this.steps.length;i++){
                var stepButton=this.steps[i]._stepButton;
                if(stepNum>i){
                    stepButton.setState("");
                }else if(stepNum==i){
                    stepButton.setState("Down");
                }else{
                    stepButton.setState("Disabled");
                }
            }
        }
        if(stepNum==0||this.forwardOnly||!step.hasPreviousStep())this.previousButton.hide();
        else this.previousButton.show();
        if(!step.hasNextStep()||stepNum==this.steps.length-1){
            this.nextButton.hide();
            this.finishButton.show();
        }else{
            this.nextButton.show();
            this.finishButton.hide();
        }
    }
,isc.A.resetWizard=function isc_Wizard_resetWizard(){
        this.goToStep(0);
    }
);
isc.B._maxIndex=isc.C+16;

isc.defineClass("WizardStep").addMethods({
    enterStep:function(previousStepId){},
    exitStep:function(nextStepId){return true;},
    hasNextStep:function(){
        for(var i=this.wizard.getStepIndex(this.ID)+1;i<this.wizard.steps.length;i++)
            if(!this.wizard.getStep(i).hidden)return true;
        return false;
    },
    getNextStep:function(){
        for(var i=this.wizard.getStepIndex(this.ID)+1;i<this.wizard.steps.length;i++)
            if(!this.wizard.getStep(i).hidden)return i;
        return-1;
    },
    hasPreviousStep:function(){
        for(var i=this.wizard.getStepIndex(this.ID)-1;i>=0;i--)
            if(!this.wizard.getStep(i).hidden)return true;
        return false;
    },
    getPreviousStep:function(){
        for(var i=this.wizard.getStepIndex(this.ID)-1;i>=0;i--)
            if(!this.wizard.getStep(i).hidden)return i;
        return-1;
    },
    show:function(){
        this.hidden=false;
        this.wizard.updateButtons();
    },
    hide:function(){
        this.hidden=true;
        this.wizard.updateButtons();
        if(this.wizard.getCurrentStep()==this){
            var newStep=this.getPreviousStep();
            if(newStep==-1)newStep=this.getNextStep();
            this.wizard.goToStep(newStep);
        }
    }
});
isc.DataSource.create({
    ID:"isc_XMethodsServices",
    _internal:true,
    dataURL:"shortServiceListing.xml",
    recordName:"service",
    recordXPath:"/default:inspection/default:service",
    fields:[
        {name:"abstract",title:"Description"},
        {name:"xMethodsPage",title:"Site",type:"link",width:50,
          valueXPath:".//wsilxmethods:serviceDetailPage/@location"
        },
        {name:"wsdlURL",title:"WSDL",type:"link",width:50,
          valueXPath:
             "default:description[@referencedNamespace='http://schemas.xmlsoap.org/wsdl/']/@location"
        }
    ]
});
isc.defineClass("DSWizardBase","VLayout");
isc.A=isc.DSWizardBase.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.autoChildParentMap={
    nextButton:"navToolbar",
    previousButton:"navToolbar",
    finishButton:"navToolbar"
};
isc.B.push(isc.A.initWidget=function isc_DSWizardBase_initWidget(){
    this.Super(this._$initWidget,arguments);
    if(this.dsDataSource)this.dsDataSource=isc.DataSource.get(this.dsDataSource);
    this.addAutoChild("stepInstructions",{
        contents:"Instructions",
        padding:4,
        height:20,
        wrap:false,
        overflow:"visible"
    },isc.Label);
    this.addAutoChild("navToolbar",{
        height:22,
        layoutMargin:10,
        membersMargin:10
    },isc.HLayout);
    this.addAutoChild("previousButton",{
        title:"< Previous",
        click:"this.creator.previousPage()",
        visibility:"hidden"
    },isc.Button);
    this.navToolbar.addMember(isc.LayoutSpacer.create());
    this.addAutoChild("nextButton",{
        title:"Next >",
        click:"this.creator.nextPage()",
        disabled:true,
        setDisabled:function(disabled){
            var returnval=this.Super('setDisabled',arguments);
            this.creator._nextButtonDisabled(disabled);
        }
    },isc.Button);
    this.addAutoChild("finishButton",{
        title:"Finish",
        click:"this.creator.finish()",
        visibility:"hidden"
    },isc.Button);
    this.goToPage(0,true);
}
,isc.A.getPage=function isc_DSWizardBase_getPage(pageId){return isc.Class.getArrayItem(pageId,this.pages);}
,isc.A.getCurrentPage=function isc_DSWizardBase_getCurrentPage(){return this.getPage(this.currentPageNum);}
,isc.A.getPageIndex=function isc_DSWizardBase_getPageIndex(pageId){return isc.Class.getArrayItemIndex(pageId,this.pages);}
,isc.A.getPageView=function isc_DSWizardBase_getPageView(pageName,enteringPage){
    var page=this.getPage(pageName),
        pageId=page.ID;
    if(!pageId)return page.view;
    if(enteringPage){
        var enterFunction="enter"+pageId;
        if(this[enterFunction])this[enterFunction](page,pageId);
        else this.enterPage(page,pageId);
    }
    return page.view;
}
,isc.A.enterPage=function isc_DSWizardBase_enterPage(page,pageId){}
,isc.A.goToPage=function isc_DSWizardBase_goToPage(pageId,firstPage){
    if(firstPage){
        for(var i=0;i<this.pages.length;i++){
            if(this.pages[i].view)this.pages[i].view.hide();
        }
    }else{
        this.getPageView(this.currentPageNum).hide();
    }
    var page=this.getPage(pageId);
    this.currentPageNum=this.getPageIndex(page);
    var view=this.getPageView(pageId,true);
    if(page.instructions)this.stepInstructions.setContents(page.instructions);
    else this.stepInstructions.hide();
    this.addMember(view,1);
    view.show();
    this.updateButtons();
}
,isc.A.go=function isc_DSWizardBase_go(direction){
    var index=this.getPageIndex(this.currentPageNum);
    index+=direction;
    this.goToPage(this.getPage(index));
}
,isc.A.nextPage=function isc_DSWizardBase_nextPage(){
    var currentPage=this.getPage(this.currentPageNum);
    if(currentPage.nextPage)this.goToPage(currentPage.nextPage);
    else this.go(1);
}
,isc.A.previousPage=function isc_DSWizardBase_previousPage(){
    var currentPage=this.getPage(this.currentPageNum);
    if(currentPage.previousPage)this.goToPage(currentPage.previousPage);
    else this.go(-1);
}
,isc.A.finish=function isc_DSWizardBase_finish(){
    this.hide();
    this.resetWizard();
}
,isc.A.updateButtons=function isc_DSWizardBase_updateButtons(){
    var pageNum=this.getPageIndex(this.currentPageNum);
    if(pageNum==0)this.previousButton.hide();
    else this.previousButton.show();
    if(this.getPage(pageNum).endPage||pageNum==this.pages.length-1){
        this.nextButton.hide();
        this.finishButton.show();
    }else{
        this.nextButton.setDisabled(this.nextButtonIsDisabled(pageNum));
        this.nextButton.show();
        this.finishButton.hide();
    }
}
,isc.A._nextButtonDisabled=function isc_DSWizardBase__nextButtonDisabled(disabled){
    if(!this._nextEnabledMap)this._nextEnabledMap=[];
    this._nextEnabledMap[this.currentPageNum]=!disabled;
}
,isc.A.nextButtonIsDisabled=function isc_DSWizardBase_nextButtonIsDisabled(pageNum){
    return this._nextEnabledMap?!this._nextEnabledMap[pageNum]:true;
}
,isc.A.resetWizard=function isc_DSWizardBase_resetWizard(){
    delete this._nextEnabledMap;
    this.goToPage(0,true);
}
,isc.A.startAt=function isc_DSWizardBase_startAt(wizardRecord){
    this._startAtRecord=wizardRecord;
    this.resetWizard();
    if(wizardRecord)this.nextPage();
    if(!wizardRecord||!wizardRecord.wizardConstructor)this.show();
}
);
isc.B._maxIndex=isc.C+16;

isc.defineClass("DSWizard","DSWizardBase");
isc.A=isc.DSWizard;
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A._wizardFilterProperties={
        "allowDataSourceImport":"allowDataSourceImport",
        "onSite":"onSiteMode"
    };
isc.B.push(isc.A.loadWizardNodes=function isc_c_DSWizard_loadWizardNodes(builder,callback){
        if(!builder)return;
        var wizardsDS=isc.DataSource.create({
            recordXPath:"/PaletteNodes/PaletteNode",
            preventHTTPCaching:false,
            fields:{
                name:{name:"name",type:"text",length:8,required:true},
                title:{name:"title",type:"text",title:"Title",length:128,required:true},
                className:{name:"className",type:"text",title:"Class Name",length:128,required:true},
                icon:{name:"icon",type:"image",title:"Icon Filename",length:128},
                iconWidth:{name:"iconWidth",type:"number",title:"Icon Width"},
                iconHeight:{name:"iconHeight",type:"number",title:"Icon Height"},
                iconSize:{name:"iconSize",type:"number",title:"Icon Size"},
                showDropIcon:{name:"showDropIcon",type:"boolean",title:"Show Drop Icon"},
                defaults:{name:"defaults",type:"Canvas",propertiesOnly:true},
                children:{name:"children",type:"isc_paletteNode",multiple:true}
            }
        });
        wizardsDS.dataURL=isc.RPCManager.safelyCombinePaths(
            builder.workspacePath,builder.basePathRelWorkspace,builder.dataSourceWizardsURL);
        wizardsDS.fetchData({},function(dsResponse,data){
            callback(data);
            wizardsDS.destroy();
        });
    }
,isc.A.shouldShowWizard=function isc_c_DSWizard_shouldShowWizard(record,builder){
        var show=true;
        for(var key in this._wizardFilterProperties){
            var property=this._wizardFilterProperties[key];
            if(record[key]!=null&&
                ((record[key]=='true'&&!builder[property])||
                    (record[key]=='false'&&builder[property])))
            {
                show=false;
                break;
            }
        }
        return show;
    }
);
isc.B._maxIndex=isc.C+2;

isc.A=isc.DSWizard.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.pages=[
    {ID:"StartPage",
      instructions:"Select the source of data to bind to:"
    },
    {ID:"PickOperationPage",
      instructions:"Select a public Web Service, or enter a WSDL file URL.  Then select"+
                   " the operation to invoke"
    },
    {ID:"CallServicePage",
      instructions:"Use the provided form to invoke the web service and obtain a sample"+
                   " result, then select an approriate element set for list binding"
    },
    {ID:"BindingPage",
      instructions:"Below is a default binding to a ListGrid.  Use the field editor to "+
                   "customize the binding",
      endPage:true
    },
    {
      ID:"SFPickEntityPage",
      instructions:"Choose an object type you would like to use in SmartClient applications"
    },
    {
      ID:"SFDonePage",
      instructions:"Below is an example of a grid bound to the chosen SForce Object",
      endPage:true
    },
    {
      ID:"KapowPickRobotPage",
      instructions:"Choose the Kapow Robot(s) you would like to use in SmartClient applications"
    }
];
isc.A.wizardDefaultWidth="85%";
isc.A.wizardDefaultHeight="85%";
isc.A.servicePickerDefaults={
    recordClick:function(viewer,record,recordNum){
        var wsdlURL=this.getRawCellValue(record,recordNum,this.getFieldNum("wsdlURL"));
        this.logWarn("wsdlURL is: "+wsdlURL);
        this.creator.fetchWSDL(wsdlURL);
    }
};
isc.A.operationPickerDefaults={
    recordClick:function(viewer,record,recordNum){
        var operationName=this.getRawCellValue(record,recordNum,this.getFieldNum("name"));
        this.creator.wsdlDoc=this.data.document;
        this.creator.operationName=operationName;
        this.creator.nextButton.enable();
    },
    alternateRecordStyles:true
};
isc.B.push(isc.A.enterStartPage=function isc_DSWizard_enterStartPage(page){
    if(!this.dsTypePicker){
        this.createDSTypePicker();
        page.view=this.dsTypePicker;
    }
    this.nextButton.setDisabled(this.dsTypePicker.getValue("dsType")==null);
}
,isc.A.createDSTypePicker=function isc_DSWizard_createDSTypePicker(){
    this.dsTypePicker=this.createAutoChild("dsTypePicker",{
        layoutAlign:"center",
        width:350,
        showHeader:false,
        selectionType:"single",
        leaveScrollbarGap:false,
        width:300,
        showAllRecords:true,
        bodyOverflow:"visible",
        overflow:"visible",
        selectionChanged:function(){
            this.creator.nextButton.setDisabled(!this.anySelected());
        },
        getValue:function(){
            var record=this.getSelectedRecord();
            if(!record)return null;
            return record.name;
        },
        clearValues:function(){
            this.deselectAllRecords();
        },
        defaultEditContext:isc.EditPane.create({visibility:"hidden"}),
        recordDoubleClick:function(){
            this.creator.nextPage();
        }
    },isc.TreePalette);
    var _this=this;
    isc.DSWizard.loadWizardNodes(this.callingBuilder,function(data){
        _this.fetchWizardsReply(data,_this.callingBuilder);
        _this.openWizardTree();
    });
}
,isc.A.fetchWizardsReply=function isc_DSWizard_fetchWizardsReply(data,builder){
    for(var i=data.length-1;i>=0;i--){
        var node=data[i];
        if(!isc.DSWizard.shouldShowWizard(node,builder)){
            data.removeAt(i);
        }
    }
    this.dsTypePicker.data.addList(data,this.dsTypePicker.data.getRoot());
}
,isc.A.openWizardTree=function isc_DSWizard_openWizardTree(data){
    var tree=this.dsTypePicker.data;
    tree.openAll();
}
,isc.A.nextPage=function isc_DSWizard_nextPage(){
    var dsType=this.dsTypePicker.getValue(),
        record=this.dsTypePicker.getSelectedRecord();
        _this=this;
    if(this._startAtRecord){
        record=this._startAtRecord;
        dsType=record.name;
        delete this._startAtRecord;
        if(this.logIsDebugEnabled("dsWizard")){
            this.logDebug("Start DS Wizard at: "+this.echo(record),"dsWizard");
        }
    }
    this.dsTypeRecord=record;
    if(this.currentPageNum==0){
        if(record.wizardConstructor){
            if(!record.wizardDefaults){
                record.wizardDefaults={};
            }
            record.wizardDefaults.width=this.wizardDefaultWidth;
            record.wizardDefaults.height=this.wizardDefaultHeight;
            record.wizardDefaults.autoCenter=true;
            record.wizardDefaults.showDataView=true;
            record.wizardDefaults.builder=this.callingBuilder;
            var context;
            if(isc.isAn.EditContext(this.dsTypePicker.defaultEditContext)){
                context=this.dsTypePicker.defaultEditContext;
            }else if(this.dsTypePicker.defaultEditContext.getEditContext&&
                        isc.isAn.EditContext(this.dsTypePicker.defaultEditContext.getEditContext()))
            {
                context=this.dsTypePicker.defaultEditContext.getEditContext();
            }else{
                this.logWarn("ERROR: dsTypePicker's defaultEditContext neither 'is an' "+
                                "nor 'has an' EditContext.  Expect a null pointer exception!");
            }
            if(this.logIsDebugEnabled("dsWizard")){
                this.logDebug("Request DS Wizard Object: "+this.echoFull(record),"dsWizard");
            }
            context.requestLiveObject(record,function(results){
                var wizardDefaults=(results?results.wizardDefaults:null),
                    isNew=(wizardDefaults?wizardDefaults.existingDS==null:true)
                ;
                _this.showDSEditor(results,isNew,instructions);
            },this.dsTypePicker);
            if(this.callingBuilder)this.callingBuilder.wizardWindow.hide();
            return;
        }
        if(record&&record.className=="JavaBean"){
            var _this=this,
                defaults=record?record.wizardDefaults:{};
            if(!defaults||!defaults.serverConstructor){
                isc.say("NOTE: This wizard <b>does not generate a fully functioning "+
                    "DataSource</b>; it creates a DataSource descriptor (.ds.xml file) which "+
                    "is ready to be loaded and bound to UI components, but does not provide "+
                    "CRUD functionality (search and editing of objects)."+
                    "<P>"+
                    "If you are using SQL or Hibernate, use the SQL or Hibernate wizards "+
                    "instead to generate a fully functional DataSource.  Otherwise, read the "+
                    "<a target='_blank' "+
                    "href='http://localhost:8080/isomorphic/system/reference/SmartClient_Reference.html#group..clientServerIntegration'>"+
                    "Client-Server Integration</a> topic in the <i>SmartClient Reference</i> "+
                    "to learn how to create a custom DataSource connector.",
                    function(){
                        _this.startJavaBeanWizard(_this,record);
                    }
                );
                return;
            }
            this.startJavaBeanWizard(this,record);
            return;
        }
        if(dsType=="sforce"){
            var wizard=this,
                service=isc.WebService.get("urn:partner.soap.sforce.com");
            service.ensureLoggedIn(
                function(){wizard.goToPage("SFPickEntityPage");},
                true
            );
            return;
        }else if(dsType=="kapow"){
            var wizard=this;
            if(!this.robotServerPicker)this.robotServerPicker=isc.RobotServerPicker.create({
                robotServerSelected:function(){wizard.goToPage("KapowPickRobotPage");}
            });
            this.robotServerPicker.show();
            return;
        }else if(dsType=="webService"){
            var wizard=this;
            var nextButton=isc.IButton.create({
                autoShow:false,
                title:"Next",
                autoFit:true,
                click:function(){wizard.servicePicker.hide();wizard.pickOperation();}
            });
            if(!this.servicePicker)this.servicePicker=isc.Dialog.create({
                title:"Enter WSDL Webservice URL",
                isModal:true,
                autoShow:false,
                autoSize:true,
                autoCenter:true,
                bodyDefaults:{padding:10},
                items:[
                    isc.DynamicForm.create({
                        autoShow:false,
                        values:{serviceURL:"http://"},
                        itemKeyPress:function(item,keyName){
                            if(keyName=='Enter'){
                                nextButton.click();
                            }
                        },
                        items:[
                            {name:"serviceURL",title:"WSDL URL",type:"text",width:400}
                        ]
                    }),
                    isc.LayoutSpacer.create({height:10}),
                    isc.HLayout.create({
                        height:1,
                        membersMargin:5,
                        members:[
                            nextButton,
                            isc.IButton.create({
                                autoShow:false,
                                title:"Cancel",
                                autoFit:true,
                                click:function(){wizard.servicePicker.hide();}
                            })
                        ]
                    })
                ]
            });
            this.servicePicker.show();
            return;
        }else if(dsType&&dsType!="webService"){
            var props,
                instructions;
            if(dsType.contains("Hibernate")){
                instructions="Each field you enter below corresponds to a database column "+
"of the same name.  The table name will be the same as the DataSource ID by default, or you "+
"may enter a Table Name below.  Hibernate database settings are in "+
"[webroot]/WEB-INF/classes/hibernate.cfg.xml";
                props={
                    dataFormat:"iscServer",
                    serverType:"hibernate"
                };
            }else if(dsType.contains("SQL")){
                instructions="Each field you enter below corresponds to a database column "+
"of the same name.  The table name will be the same as the DataSource ID by default, or you "+
"may enter a Table Name below.  By default, the default DataBase shown in the Admin Console "+
"will be used, or you may enter \"Database Name\" below.";
                props={
                    dataFormat:"iscServer",
                    serverType:"sql"
                };
            }else if(dsType=="simpleXML"){
                instructions="For \"dataURL\", enter a URL which will return XML data.<P>"+
"For \"recordXPath\", enter an XPath that will select the XML tags you wish to use as rows. "+
"For example, if the tag you want is named \"Person\", a recordXPath of \"//Person\" will "+
"work for most simple XML formats.<P>"+
"Enter fields named after the subelements and attributes of the tag used for rows.  Click "+
"the \"More\" button to see more field properties and documentation, particularly \"valueXPath\"";
                props={dataFormat:"xml"};
            }else if(dsType=="json"){
                instructions=
"For \"dataURL\", enter a URL which will return JSON data.<P>"+
"For \"recordXPath\", enter an XPath to an Array of Objects in the JSON data, then enter fields for each property of those Objects which you want to display, and its type.<P>"+
"Click the \"More\" button to see more field properties and documentation, particularly \"valueXPath\"";
                props={dataFormat:"json"};
            }else if(dsType=="rss"){
                instructions="Enter the URL of the RSS feed as \"dataURL\" below, then add or remove fields.";
                props={
                    dataFormat:"xml",
                    recordXPath:"//default:item|//item",
                    fields:[
                        {name:"title",title:"Title"},
                        {name:"link",title:"Story",type:"link"},
                        {name:"description",title:"Description"},
                        {name:"pubDate",title:"Published"}
                    ]
                };
            }
            if(record.wizardDefaults){
                props.wizardDefaults=isc.addProperties({},record.wizardDefaults);
            }
            this.showDSEditor(props,true,instructions);
            return;
        }
    }
    this.Super("nextPage");
}
,isc.A.pickOperation=function isc_DSWizard_pickOperation(){
    isc.showPrompt("Loading WSDL...");
    isc.XML.loadWSDL(this.servicePicker.items[0].getValue("serviceURL"),
        this.getID()+".webServiceLoaded(service)",
        null,
        true
    );
}
,isc.A.webServiceLoaded=function isc_DSWizard_webServiceLoaded(service){
    isc.clearPrompt();
    if(service){
        this.servicePicker.items[0].setValue("serviceURL","http://");
        var vb=this.callingBuilder;
        if(!vb.operationsPalette){
            if(vb.showRightStack!=false){
                vb.showOperationsPalette=true;
                vb.addAutoChild("operationsPalette");
                vb.rightStack.addSection({title:"Operations",autoShow:true,
                    items:[vb.operationsPalette]
                },1);
            }
            for(var i=0;i<service.portTypes.length;i++){
                var portType=service.portTypes[i];
                for(var j=0;j<portType.operation.length;j++){
                    var operation=portType.operation[j];
                    var soConfig={
                        operationName:operation.name,
                        serviceNamespace:service.serviceNamespace,
                        serviceName:service.serviceName||service.name,
                        serviceDescription:service.serviceName||service.serviceNamespace,
                        portTypeName:portType.portTypeName,
                        location:service.location
                    };
                    vb.addWebService(service,soConfig);
                }
            }
        }
        vb.wizardWindow.hide();
    }
}
,isc.A.fetchWSDL=function isc_DSWizard_fetchWSDL(wsdlURL){
    this.wsdlURL=wsdlURL;
    if(wsdlURL!=null){
        if(isc.isA.ResultSet(this.operationPicker.data)){
            this.operationPicker.data.invalidateCache();
        }
        this.operationPicker.fetchData(null,null,{dataURL:wsdlURL});
    }
}
,isc.A.enterCallServicePage=function isc_DSWizard_enterCallServicePage(page){
    var wsdlURL=this.wsdlURL;
    isc.xml.loadWSDL(wsdlURL,this.getID()+"._wsdlLoaded(service)");
    if(this.serviceInput!=null)return;
    var view=this.createAutoChild("callServicePage",{
        visibilityMode:"multiple"
    },isc.SectionStack);
    page.view=view;
    this.serviceInput=this.createAutoChild("serviceInput",{
    },isc.DynamicForm);
    var callServiceButton=this.createAutoChild("callServiceButton",{
        title:"Call Service",
        click:"this.creator.callService()",
        resizeable:false
    },isc.Button);
    view.addSection({title:"Service Inputs",autoShow:true,items:[
        this.serviceInput,
        callServiceButton
    ]});
    this.requestEditor=this.createAutoChild("requestEditor",{
        height:250,
        fields:[
            {name:"useEditedMessage",title:"Use Edited Message",type:"checkbox",
             defaultValue:false},
            {name:"requestBody",showTitle:false,type:"textArea",width:"*",height:"*",
             colSpan:"*"}
        ]
    },isc.DynamicForm);
    view.addSection({title:"Request Editor",items:[this.requestEditor]});
    this.serviceOutput=this.createAutoChild("serviceOutput",{
        showHeader:false,
        wrapCells:true,
        fixedRecordHeights:false
    },isc.DOMGrid);
    view.addSection({title:"Service Output",autoShow:true,items:[this.serviceOutput]});
    this.expressionForm=this.createAutoChild("expressionForm",{
        numCols:4,
        colWidths:[120,150,"*",50],
        items:[
            {name:"selectBy",title:"Select Records By",width:"*",
             valueMap:{tagName:"Tag Name",xpath:"XPath Expression"},
             defaultValue:"xpath"},
            {name:"expression",showTitle:false,width:"*"},
            {type:"button",title:"Select",width:"*",startRow:false,
             click:"form.creator.selectNodes()"}
        ]
    },isc.DynamicForm);
    this.selectedNodesView=this.createAutoChild("selectedNodesView",{
        showHeader:false,
        showRoot:false,
        wrapCells:true,
        fixedRecordHeights:false
    },isc.DOMGrid);
    view.addSection({title:"Select Elements",autoShow:true,
                      items:[this.expressionForm,this.selectedNodesView]});
}
,isc.A._wsdlLoaded=function isc_DSWizard__wsdlLoaded(service){
    this.service=service;
    this.serviceInput.setDataSource(this.service.getInputDS(this.operationName));
}
,isc.A.callService=function isc_DSWizard_callService(){
    if(!this.serviceInput.validate())return;
    var inputDS=this.serviceInput.dataSource,
        criteria=this.serviceInput.getValuesAsCriteria(),
        serviceInputs=this.serviceInputs=inputDS.getServiceInputs({data:criteria});
    if(this.requestEditor){
        if(this.requestEditor.getValue("useEditedMessage")){
            var requestBody=this.requestEditor.getValue("requestBody");
            serviceInputs.requestBody=requestBody;
        }else{
            this.requestEditor.setValue("requestBody",serviceInputs.requestBody);
        }
    }
    serviceInputs.callback=
        this.getID()+".serviceOutput.setRootElement(xmlDoc.documentElement)";
    isc.xml.getXMLResponse(serviceInputs);
}
,isc.A.selectNodes=function isc_DSWizard_selectNodes(){
    var expressionForm=this.expressionForm,
        sourceDoc=this.serviceOutput.rootElement,
        selectedNodes;
    this.selectBy=expressionForm.getValue("selectBy");
    if(this.selectBy=="xpath"){
        this.recordName=null;
        this.recordXPath=expressionForm.getValue("expression");
        selectedNodes=isc.xml.selectNodes(sourceDoc,this.recordXPath);
    }else{
        this.recordXPath=null;
        this.recordName=expressionForm.getValue("expression");
        var nodeList=sourceDoc.getElementsByTagName(this.recordName);
        selectedNodes=[];
        for(var i=0;i<nodeList.length;i++)selectedNodes.add(nodeList[i]);
    }
    this.selectedNodesView.setRootElement({childNodes:selectedNodes});
    this.selectedNodes=selectedNodes;
    this.nextButton.enable();
}
,isc.A.enterBindingPage=function isc_DSWizard_enterBindingPage(page){
    var sampleData=this.selectedNodesView.data,
        sampleNode=sampleData.get(0)._element,
        nodeType=sampleNode.getAttribute("xsi:type")||sampleNode.tagName;
    if(nodeType.contains(":"))nodeType=nodeType.substring(nodeType.indexOf(":")+1);
    var ds=this.outputDS=isc.DS.get(nodeType);
    this.logWarn("nodeType is: "+nodeType+", ds is: "+ds);
    this.boundGrid=this.createAutoChild("boundGrid",{
        dataSource:ds,
        data:this.selectedNodes,
        alternateRecordStyles:true
    },isc.ListGrid);
    page.view=this.boundGrid;
}
,isc.A.enterKapowPickRobotPage=function isc_DSWizard_enterKapowPickRobotPage(page){
    if(!this.kapowRobotList){
        this.kapowRobotList=this.createAutoChild("kapowRobotList",{
            selectionChanged:function(){
                var hasSelection=this.getSelectedRecord()!=null;
                this.creator.nextButton.setDisabled(!hasSelection);
            }
        },isc.ListGrid);
        page.view=this.kapowRobotList;
    }
    var kapowRobotListDS=isc.XJSONDataSource.create({
        ID:"kapowRobotListDS",
        callbackParam:"json.callback",
        dataURL:window.robotServerURL+"/ISCVBListAllRobots?format=JSON",
        fields:[
            {name:"name",title:"Robot"},
            {name:"type",title:"Type"}
        ],
        transformResponse:function(dsResponse){
            var data=[];
            for(var i=0;i<dsResponse.data.length;i++){
                var robot=dsResponse.data[i];
                if(robot.name.startsWith("ISCVB"))continue;
                data.add(robot);
            }
            dsResponse.data=data;
            dsResponse.totalRows=dsResponse.data.length;
            dsResponse.endRow=dsResponse.data.length-1;
            return dsResponse;
        }
    });
    this.kapowRobotList.setDataSource(kapowRobotListDS);
    this.kapowRobotList.fetchData();
}
,isc.A.kapowFinish=function isc_DSWizard_kapowFinish(){
    var robots=this.kapowRobotList.getSelection(),
        robotsLength=robots.length;
    for(var i=0;i<robotsLength;++i){
        var robot=robots[i];
        isc.XMLTools.loadXML(window.robotServerURL+"/admin/"+robot.name+".robot",this.getID()+".kapowRobotLoaded(xmlDoc,'"+robot.name+"','"+robot.type+"')");
    }
}
,isc.A.saveDataSource=function isc_DSWizard_saveDataSource(ds){
    var dsClass=ds.getClassName();
    var schema;
    if(isc.DS.isRegistered(dsClass)){
        schema=isc.DS.get(dsClass);
    }else{
        schema=isc.DS.get("DataSource");
        ds._constructor=dsClass;
    }
    var xml=schema.xmlSerialize(ds);
    this.logWarn("saving DS with XML: "+xml);
    this.dsDataSource.saveFile({
        fileName:ds.ID,
        fileType:"ds",
        fileFormat:"xml"
    },xml);
}
,isc.A.kapowRobotLoaded=function isc_DSWizard_kapowRobotLoaded(xmlDoc,robotName,robotType){
    this.logInfo("loaded robot: "+robotName);
    var outputs=isc.xml.selectNodes(xmlDoc,"//property[@name='startModelObjects']/element[@class='kapow.robot.common.domain.Entity']/property");
    outputs=isc.xml.toJS(outputs);
    var outputFields=[];
    for(var i=0;i<outputs.length;i++){
        var prop=outputs[i];
        if(!prop.xmlTextContent)continue;
        outputFields.add({
            name:prop.xmlTextContent,
            type:this.fieldTypeForJavaClass(prop["class"])
        });
    }
    this.logWarn("Robot: "+robotName+" - derived outputFields: "+isc.echoAll(outputFields));
    var outputDS;
    if(outputFields.length){
        outputDS=isc.DataSource.create({
            ID:robotName+"DS",
            callbackParam:"json.callback",
            dataURL:window.robotServerURL+"/"+robotName+"?format=JSON",
            noAutoFetch:true,
            fields:outputFields,
            dataFormat:"json",
            dataTransport:"scriptInclude"
        });
    }else if(robotType=="rss"){
        var outputDS=isc.DataSource.create({
            ID:robotName+"DS",
            dataURL:window.robotServerURL+"/"+robotName,
            recordXPath:"//default:item",
            noAutoFetch:true,
            fields:[
                {name:"title"},
                {name:"link",type:"link"},
                {name:"description"},
                {name:"created"},
                {name:"category"},
                {name:"email"},
                {name:"name"},
                {name:"rights"}
            ]
        });
    }
    if(outputDS){
        this.callingBuilder.addDataSource(outputDS);
        this.saveDataSource(outputDS);
    }
    var inputs=isc.xml.selectNodes(xmlDoc,"//property[@name='queryParameters']/element[@class='kapow.robot.common.domain.Entity']/property");
    inputs=isc.xml.toJS(inputs);
    var inputFields=[];
    for(var i=0;i<inputs.length;i++){
        var prop=inputs[i];
        if(!prop.xmlTextContent)continue;
        if(prop.name&&prop.name.startsWith("value"))continue;
        inputFields.add({
            name:prop.xmlTextContent,
            type:this.fieldTypeForJavaClass(prop["class"])
        });
    }
    this.logWarn("Robot: "+robotName+" - derived inputFields: "+isc.echoAll(inputFields));
    if(inputFields.length){
        var inputDS=isc.DataSource.create({
            ID:robotName+"InputDS",
            type:"generic",
            fields:inputFields
        });
        this.callingBuilder.addDataSource(inputDS);
        this.saveDataSource(inputDS);
    }
    if(this.callingBuilder)this.callingBuilder.wizardWindow.hide();
    this.resetWizard();
}
,isc.A.fieldTypeForJavaClass=function isc_DSWizard_fieldTypeForJavaClass(c){
    switch(c){
        case"java.lang.Boolean":
            return"boolean";
        case"java.util.Date":
            return"date";
        case"java.lang.Byte":
        case"java.lang.Short":
        case"java.lang.Integer":
        case"java.lang.Long":
        case"java.lang.BigInteger":
            return"integer";
        case"java.lang.Float":
        case"java.lang.Double":
        case"java.lang.BigDecimal":
            return"float";
        default:
            return"text";
    }
}
,isc.A.enterSFPickEntityPage=function isc_DSWizard_enterSFPickEntityPage(page){
    this.sfService=isc.WebService.get("urn:partner.soap.sforce.com");
    if(!this.sfEntityList){
        this.sfEntityList=this.createAutoChild("sfEntityList",{
            fields:[{name:"objectType",title:"Object Type"}],
            selectionChanged:function(){
                var hasSelection=this.getSelectedRecord()!=null;
                this.creator.nextButton.setDisabled(!hasSelection);
            }
        },isc.ListGrid);
        page.view=this.sfEntityList;
    }
    this.sfService.getEntityList({target:this,methodName:"getEntityListReply"});
}
,isc.A.getEntityListReply=function isc_DSWizard_getEntityListReply(list){
    var objects=[];
    for(var i=0;i<list.length;i++){
        objects.add({objectType:list[i]});
    }
    this.sfEntityList.setData(objects);
}
,isc.A.enterSFDonePage=function isc_DSWizard_enterSFDonePage(page){
    var objectType=this.sfEntityList.getSelectedRecord().objectType;
    if(!this.sfGrid){
        this.sfGrid=this.createAutoChild("sfGrid",{
        },isc.ListGrid);
    }
    this.sfService.getEntity(objectType,{target:this,methodName:"showSFBoundGrid"});
    page.view=this.sfGrid;
}
,isc.A.showSFBoundGrid=function isc_DSWizard_showSFBoundGrid(schema){
    this.sfGrid.setDataSource(schema);
    this.sfGrid.fetchData();
}
,isc.A.sfFinish=function isc_DSWizard_sfFinish(){
    this.showDSEditor(this.sfGrid.dataSource,true,
                      "You can remove fields below to prevent them from being shown, "+
                      "and alter user-visible titles.");
}
,isc.A.finish=function isc_DSWizard_finish(){
    if(this.getCurrentPage().ID=="SFDonePage")return this.sfFinish();
    if(this.getCurrentPage().ID=="KapowPickRobotPage")return this.kapowFinish();
    this.logWarn("passing output DS: "+this.echo(this.outputDS));
    var ds=this.service.getFetchDS(this.operationName,this.outputDS);
    ds.recordXPath=this.recordXPath;
    ds.recordName=this.recordName;
    ds.fetchSchema.defaultCriteria=isc.addProperties({},this.serviceInput.getValues());
    this.logWarn("created DataSource with props: "+this.echo(ds));
    this.showDSEditor(ds);
}
,isc.A.showDSEditor=function isc_DSWizard_showDSEditor(ds,isNew,instructions){
    if(this.logIsDebugEnabled("dsWizard")){
        this.logDebug("DS Wizard show DS Editor: "+this.echoFull(ds),"dsWizard");
    }
    this.callingBuilder.openDSEditor(ds,isNew,instructions);
    this.callingBuilder.wizardWindow.hide();
    this.resetWizard();
}
,isc.A.closeClick=function isc_DSWizard_closeClick(){
    this.Super("closeClick",arguments);
    this.resetWizard();
}
,isc.A.resetWizard=function isc_DSWizard_resetWizard(){
    if(this.dsTypePicker)this.dsTypePicker.clearValues();
    if(this.servicePicker&&this.servicePicker.selectionManager){
        this.servicePicker.selectionManager.deselectAll();
        this.servicePicker.fireSelectionUpdated();
    }
    if(this.operationPicker)this.operationPicker.setData([]);
    if(this.callServicePage){
        this.serviceInput.clearValues();
        this.serviceOutput.setData([]);
        this.expressionForm.clearValues();
        this.selectedNodesView.setData([]);
    }
    this.Super("resetWizard",arguments);
}
,isc.A.startJavaBeanWizard=function isc_DSWizard_startJavaBeanWizard(wizard,record){
    isc.askForValue("Enter the name of the JavaBean for which you want to generate a DataSource.",
        function(value){
            wizard.continueJavaBeanWizard(wizard,record,value);
        },{width:400}
    );
}
,isc.A.continueJavaBeanWizard=function isc_DSWizard_continueJavaBeanWizard(wizard,record,value){
    if(value){
        wizard.getJavaBeanDSConfig(wizard,record,value);
    }
}
,isc.A.getJavaBeanDSConfig=function isc_DSWizard_getJavaBeanDSConfig(wizard,record,className){
    if(className!=null){
        isc.DMI.call("isc_builtin","com.isomorphic.tools.BuiltinRPC",
            "getDataSourceConfigFromJavaClass",
            className,
            function(data){
                wizard.finishJavaBeanWizard(wizard,record,className,data);
            }
        );
    }
}
,isc.A.finishJavaBeanWizard=function isc_DSWizard_finishJavaBeanWizard(wizard,record,className,response){
    var config=response.data.dsConfig?response.data.dsConfig:null;
    if(isc.isAn.Object(config)){
        if(record.wizardDefaults)isc.addProperties(config,record.wizardDefaults);
        wizard.showDSEditor(config,true);
    }else{
        isc.say(config);
    }
}
);
isc.B._maxIndex=isc.C+31;

isc.defineClass("SampleDataDSWizard","Window");
isc.A=isc.SampleDataDSWizard.getPrototype();
isc.A.orientation="vertical";
isc.A.title="Create DataSource";
isc.A.width="85%";
isc.A.height="85%";
isc.A.isModal=true;
isc.A.showModalMask=true;
isc.A.canDragResize=true;
isc.A.formatHelpText="<h2>General data format</h2>"+
        "<p>"+
        "<h3>Mockup text</h3>"+
        "<p>"+
        "Data intended for a ListGrid or TreeGrid, expressed in a simple text "+
        "format popularized by mockup tools such as balsamiq and now "+
        "commonly supported in a variety of mockup tools."+
        "<p>"+
        "<b><i>Grid Data</i></b>"+
        "<p>"+
        "Data for a grid is expressed in rows of data with columns separated by "+
        "commas. The first row is assumed to the header titles and is also used "+
        "to name the DataSource fields. Default sort order for column can be "+
        "specified by a trailing v or ^."+
        "<p>"+
        "Column widths and simple formatting are optionally defined by adding a "+
        "trailing row after the data that is wrapped with {}. Each column width "+
        "is specified separated by a comma matching the header and data rows. "+
        "A column width of 0 means auto-fit column width to the data."+
        "<p>"+
        "The width values themselves are either a percentage value like 70 or 30 "+
        "for 70% and 30% respectively or relative size multiplier where 1 means "+
        "the normal size and 2 or 3, for example, indicate a field that is twice "+
        "or 3-times as large as the normal size (1)."+
        "<p>"+
        "Column alignment can be included with the column width by appending L, C "+
        "or R (left, center or right)."+
        "<p>"+
        "A single checkbox or radio button can be placed into a cell using:"+
            "<ul>"+
            "<li>Checkbox: [] or [ ]</li>"+
            "<li>Selected checkbox: [x] or [v] or [o] or [*] or [X] or [V] or [O]</li>"+
            "<li>Indeterminate checkbox: [-]</li>"+
            "<li>Radio button: () or ( )</li>"+
            "<li>Selected radio button: (x) or (v) or (o) or (*) or (X) or (V) or (O)</li>"+
            "<li>Indeterminate radio button: (-)</li>"+
            "</ul>"+
        "<p>"+
        "Field types are detected as specified below."+
        "<p>"+
        "<b><i>Tree Data</i></b>"+
        "<p>"+
        "Tree data is specified with one row of text for each node in the tree. "+
        "The first \"word\" indicates the type of node and the remaining words "+
        "are the node title. There must be at least one space after the node type."+
        "<p>"+
            "<ul>"+
            "<li>f - closed folder</li>"+
            "<li>F - open folder</li>"+
            "<li>&gt; - closed folder</li>"+
            "<li>v - open folder</li>"+
            "<li>[+] - folder with [+] icon</li>"+
            "<li>[-] - folder with [-] icon</li>"+
            "<li>[x] - node with checkbox that is checked</li>"+
            "<li>[ ] - node with an unchecked checkbox</li>"+
            "<li>- (dash) - node with a file icon</li>"+
            "<li>_ (underscore) - node with a blank icon</li>"+
            "</ul>"+
        "<p>"+
        "To indent nodes within the tree use spaces or dots. Each represents a new "+
        "level in the tree."+
        "<p>"+
        "A single text field named \"name\" is used."+
        "<p>"+
        "<h3>CSV</h3>"+
        "<p>"+
        "Data is expressed as rows of field values separated by commas. Values "+
        "can be wrapped in quotation marks (\") for clarity or to include a "+
        "comma within the field value. "+
        "<p>"+
        "Field types are detected as specified below."+
        "<p>"+
        "<h3>XML</h3>"+
        "<p>"+
        "Data is expressed as a list of XML elements containing similar element "+
        "values. The XML text is converted to JSON and then processed accordingly. "+
        "<p>"+
        "Field types are detected as specified below."+
        "<p>"+
        "<h3>Reify Export</h3>"+
        "<p>"+
        "A special format, where complete MockDataSources are represented in XML, which "+
        "developers can obtain from DataSources in existing SmartClient or SmartGWT projects (see <a href="+
        "\"https://www.smartclient.com/smartclient-latest/isomorphic/system/reference/?id=group..reifyForDevelopers"+
        "\">Reify for Developers</a> overview for details)."+
        "<p>"+
        "Reify Export format also allows multiple DataSources to be created from a single "+
        "sample data file."+
        "<p>"+
        "<h3>JSON</h3>"+
        "<p>"+
        "Data is expressed as a list of JSON objects containing similar property "+
        "values. Fields are determined by extracting the unique keys from each "+
        "record. "+
        "<p>"+
        "Field types are detected as specified below."+
        "<p>"+
        "<h2>Field value format</h2>"+
        "<p>"+
        "Field types are guessed by processing the field values to find the best "+
        "match (i.e. least conversion errors). At least 10 matching examples "+
        "must be found before determining a specialized type. "+
        "<p>"+
        "The following specialized field types are detected:"+
            "<ul>"+
            "<li><b>Integer</b> - values consist of only numerals or thousands "+
            "separator (comma).</li>"+
            "<li><b>Float</b> - values consist of numerals with decimal point and "+
            "optional thousands separator.</li>"+
            "<li><b>Boolean</b> - <i>true</i> values can be expressed as t, true, yes, "+
            "[x] or 1. <i>false</i> values can be expressed as f, false, no, [], [ ], "+
            "or 0.</li>"+
            "<li><b>Time</b> - Some example formats: "+
            "21:23, 19:14:07, 1.00pm, 2am, 3:15 am, 21:2, 10:01 and 4:33pm</li>"+
            "<li><b>Date</b> - A date can be detected with a month and year or "+
            "with month, day and year. These can be specified in the common orders "+
            "using one or two digits for month and day and two or four digits for "+
            "the year. When a two-digit year is found if the value is less than "+
            "25 a leading \"20\" is added; otherwise a leading \"19\" is added. Note "+
            "that all dates in the field must match the same digit ordering. "+
            "The separator can be a slash (/), dash (-) or period (.)."+
            "<br>Some example formats: 6-01-10, 6-11-1, 16/07/30 and 13-5-1</li>"+
            "<li><b>DateTime</b> - A dateTime is the combination of a Date and "+
            "a Time value as detailed above separated by one or more spaces. A "+
            "special \"schema\" format is also allowed as commonly found in XML: "+
            "2006-01-10T12:22:04-04:00</li>"+
            "</ul>"+
        "If no specialized field type is detected, the default type is <b>text</b>"+
        "<p>";
isc.A.importFileTooLargeMessage="Please provide a smaller sample data set. Deployed applications do not have such limits on data sets.";
isc.A.outerLayoutDefaults={
        _constructor:isc.VLayout,
        autoParent:"body",
        autoDraw:false,
        width:"100%",height:"100%",
        overflow:"hidden",
        padding:3
    };
isc.A.acceptedFileTypes={
        "XML":"text/xml",
        "CSV":"text/csv",
        "JSON":"application/json"
    };
isc.A.optionsFormDefaults={
        _constructor:isc.DynamicForm,
        autoParent:"outerLayout",
        autoDraw:false,
        dataSource:"SCUploadSaveFile",
        width:"100%",
        height:110,
        numCols:3,
        colWidths:[150,300,"*"],
        cellPadding:5,
        fields:[
            {
                name:"dataSourceName",
                type:"text",
                title:"DataSource name",
                disabledHover:"'Reify Export' format includes DataSource IDs automatically",
                readOnlyWhen:{fieldName:"inputFormat",operator:"equals",value:"Reify Export"},
                readOnlyDisplay:"disabled",
                width:"*",
                wrapTitle:false,
                hoverWidth:300,
                validateOnExit:true,
                validators:[
                    {
                        type:"requiredIf",
                        validateOnChange:true,
                        dependentFields:["inputFormat"],
                        expression:function(item,validator,value,record){
                            return record.inputFormat!="Reify Export";
                        },
                        errorMessage:"DataSource name is required"
                    },
                    {
                        type:"regexp",
                        expression:"^(?!isc_).*$",
                        errorMessage:"DataSource ID must not start with 'isc_'. That prefix is reserved for framework DataSources.'",
                        stopIfFalse:true
                    },
                    {
                        type:"regexp",
                        expression:"^[a-zA-Z_][a-zA-Z0-9_]*$",
                        errorMessage:"DataSource ID must not contain spaces or punctuation other than underscore (_), and may not start with a number",
                        stopIfFalse:true
                    },
                    {
                        type:"custom",
                        condition:function(item,validator,value,record,additionalContext){
                            if(!value)return true;
                            if(!validator.idMap){
                                var allDataSources=isc.DS.getRegisteredDataSourceObjects(),
                                    idMap={}
                                ;
                                for(var i=0;i<allDataSources.length;i++){
                                    var ds=allDataSources[i];
                                    if(ds&&ds.componentSchema){
                                        var id=ds.ID;
                                        idMap[id.toLowerCase()]=id;
                                    }
                                }
                                validator.idMap=idMap;
                            }
                            var id=validator.idMap[value.toLowerCase()]||value,
                                ds=isc.DS.get(id)
                            ;
                            return(!ds||(!ds.componentSchema&&ds.sourceDataSourceID));
                        },
                        errorMessage:"DataSource name matches a system or application DataSource. Please choose another name."
                    }
                ]
            },
            {
                type:"staticText",
                canEdit:false,
                shouldSaveValue:false,
                showTitle:false,
                width:"*",
                defaultValue:'Choose a name that reflects the things being stored, for example, if storing data about people choose "people", or if about accounts, choose "accounts"'
            },
            {
                name:"inputFormat",
                type:"radioGroup",
                title:"Select input format",
                valueMap:["Mockup text","CSV","XML","JSON","Reify Export"],
                vertical:false,
                validateOnChange:true,
                required:true,
                redrawOnChange:true,
                changed:function(form,item,value){
                    form.inputFormatChanged(value);
                }
            },
            {
                name:"formatHelpLink",
                type:"LinkItem",
                showTitle:false,
                linkTitle:"Format help",
                canEdit:false,
                target:"javascript",
                click:function(){
                    this.form.showFormatHelp();
                }
            },
            {
                type:"SpacerItem"
            },
            {
                type:"staticText",
                canEdit:false,
                shouldSaveValue:false,
                showTitle:false,
                width:"*",
                defaultValue:"Type or paste data below, or upload a file."
            },
            {
                name:"import",
                editorType:"UploadSampleDataItem",
                showTitle:false,
                width:"*",
                shouldSaveValue:false,
                init:function(){
                    if(this.form.values&&this.form.values.inputFormat){
                        var fileType=this.form.values.inputFormat,
                            accept;
                        if(fileType!="Mockup text"){
                            accept=this.form.creator.acceptedFileTypes[fileType];
                        }
                        if(accept)this.accept=accept;
                    }
                    this.Super("init",arguments);
                },
                importedData:function(data,fileName){
                    this.form.creator.importedData(data,fileName);
                }
            }
        ],
        draw:function(){
            this.Super("draw",arguments);
            if(!this._initiallyFocussed){
                this.focusInItem("dataSourceName");
                this._initiallyFocussed=true;
            }
        },
        showFormatHelp:function(){
            var window=isc.Window.create({
                autoDraw:false,
                title:"Format help",
                width:"70%",height:"70%",
                autoCenter:true,
                isModal:true,
                showModalMask:true,
                showMinimizeButton:false,
                dismissOnEscape:true,
                dismissOnOutsideClick:true,
                items:[
                    isc.HTMLPane.create({
                        autoDraw:false,
                        padding:10,
                        contents:this.formatHelpText
                    })
                ]
            });
            window.show();
            window.items[0].focus();
        },
        inputFormatChanged:function(value){}
    };
isc.A.dataFormDefaults={
        _constructor:isc.DynamicForm,
        autoParent:"outerLayout",
        autoDraw:false,
        width:"100%",
        height:"*",
        numCols:1,
        parentResized:function(skipResolve){
            this.Super("parentResized",arguments);
            this.markForRedraw();
        }
    };
isc.A.pasteDataFieldDefaults={
        name:"pasteData",
        type:"TextAreaItem",
        showTitle:false,
        width:"*",
        height:"*",
        hint:"Type or paste data here",
        showHintInField:true,
        browserSpellCheck:false
    };
isc.A.buttonLayoutDefaults={
        _constructor:isc.HLayout,
        autoParent:"outerLayout",
        autoDraw:false,
        width:"100%",height:35,
        padding:5,
        membersMargin:10,
        align:"right"
    };
isc.A.cancelButtonDefaults={
        _constructor:isc.IButton,
        autoParent:"buttonLayout",
        autoDraw:false,
        title:"Cancel",
        width:75,
        click:function(){
            this.creator.closeClick();
            this.creator.markForDestroy();
        }
    };
isc.A.createDataSourceButtonDefaults={
        _constructor:isc.IButton,
        autoParent:"buttonLayout",
        autoDraw:false,
        title:"Create DataSource",
        click:function(){
            this.creator.createDataSourceClick(this.creator.targetDSType);
        }
    };
isc.A.createDataSourceMenuDefaults={
        _constructor:isc.Menu,
        autoDraw:false,
        showIcons:false,
        showShadow:true,
        shadowDepth:10,
        itemClick:function(item){
            this.creator.createDataSourceClick(item.title);
        }
    };
isc.A.createDataSourceMenuButtonDefaults={
        _constructor:isc.MenuButton,
        autoParent:"buttonLayout",
        autoDraw:false,
        title:"Create DataSource"
    }
;

isc.A=isc.SampleDataDSWizard.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.parseDetailsDialogDefaults={
    _constructor:isc.Dialog,
    autoDraw:false,
    autoCenter:true,
    isModal:true,
    autoSize:true,
    width:100,
    title:"Parse Details",
    bodyDefaults:{layoutMargin:10,membersMargin:10},
    buttons:[
        {title:"Go back and correct data",width:175,overflow:"visible",
          click:function(){this.topElement.cancelClick();}
        },
        {title:"Ignore and proceed",width:125,overflow:"visible",
          click:function(){this.topElement.okClick();}
        }
    ]
};
isc.A.parseDetailsMessageLabelDefaults={
    _constructor:isc.Label,
    autoDraw:false,
    width:600,
    height:30,
    canSelectText:true,
    contents:"We've noticed some possible inconsistencies in your sample data - see below"
};
isc.A.errorViewerDefaults={
    _constructor:isc.ListGrid,
    autoDraw:false,
    width:600,
    autoFitData:"vertical",
    autoFitMaxRecords:10,
    hoverStyle:"vbLargeHover",
    defaultFields:[
        {name:"fieldName",title:"Field",autoFitWidth:true,minWidth:75},
        {name:"message",title:"Message",width:"*",showHover:true,hoverWidth:400}
    ]
};
isc.A.importDataTooLargeMessage="Too much sample data for DataSource '${dsId}'.  Import failed.";
isc.A.reifyExportBadFormatMessage="Unable to import data from Reify Export.  Format is not valid.";
isc.A.collisionPromptText="Some of the DataSource(s) you are trying to create - ${collisions} "+
    "- have the same IDs as DataSources already in your project.<p>What do you want to do?";
isc.A.collideDeleteExistingText="Delete existing DataSources";
isc.A.collideImportOnlyNewText="Import only new DataSources";
isc.A.collideRenameNewDSText="Rename new DataSources";
isc.B.push(isc.A.destroy=function isc_SampleDataDSWizard_destroy(){
    this.Super("destroy",arguments);
    if(this.uploadDialog)this.uploadDialog.destroy();
}
,isc.A.createChildren=function isc_SampleDataDSWizard_createChildren(){
    this.Super("createChildren");
    this.body.hPolicy="fill";
    this.body.vPolicy="fill";
    var optionsFormProperties={
            formatHelpText:this.formatHelpText,
            inputFormatChanged:function(value){this.creator.inputFormatChanged();}
        },
        dataFormProperties={fields:[isc.addProperties({},this.pasteDataFieldDefaults)]}
    ;
    if(this.existingDS){
        var ds=this.existingDS,
            inputFormat=ds.mockDataFormat.toUpperCase()
        ;
        if(inputFormat=="MOCK")inputFormat="Mockup text";
        optionsFormProperties.values={inputFormat:inputFormat,dataSourceName:ds.ID};
        dataFormProperties.values={pasteData:ds.mockData};
    }
    if(this.defaultInputFormat&&!optionsFormProperties.values){
        optionsFormProperties.values={inputFormat:this.defaultInputFormat};
    }
    this.addAutoChild("outerLayout");
    this.addAutoChild("optionsForm",optionsFormProperties);
    this.addAutoChild("dataForm",dataFormProperties);
    this.addAutoChild("buttonLayout");
    this.addAutoChild("cancelButton");
    var targetDSTypes=this.targetDSType.split(",");
    if(targetDSTypes.length==1){
        this.addAutoChild("createDataSourceButton");
    }else{
        var menuItems=targetDSTypes.map(function(dsType){
            return{title:dsType};
        });
        var menu=this.createAutoChild("createDataSourceMenu",{data:menuItems});
        this.addAutoChild("createDataSourceMenuButton",{menu:menu});
    }
    var scUploadSaveFileDS=isc.DataSource.get("SCUploadSaveFile"),
        _this=this
    ;
    scUploadSaveFileDS.performCustomOperation("checkUploadFeature",null,
        function(response,data){
            if(response.status==isc.RPCResponse.STATUS_SUCCESS){
                _this.enableImportButton();
            }
        },
        {willHandleError:true}
    );
}
,isc.A.createDataSourceClick=function isc_SampleDataDSWizard_createDataSourceClick(dsType){
    if(!this.optionsForm.validate()||!this.dataForm.validate()){
        return;
    }
    var rawData=this.dataForm.getValue("pasteData");
    if(rawData==null){
        isc.say("No data has been entered or uploaded.",null,{
            title:"Missing required field",
            icon:"[SKINIMG]Dialog/error.png"
        });
        return;
    }
    if(this.optionsForm.getValue("inputFormat")=="Reify Export"){
        return this.createDataSourcesFromReifyFormat(rawData);
    }
    var _this=this,
        dataSourceName=this.optionsForm.getValue("dataSourceName"),
        fileSpec={
            fileName:dataSourceName,
            fileType:"ds",
            fileFormat:"xml"
        }
    ;
    this.builder.dsDataSource.listFiles(fileSpec,function(dsResponse,data,dsRequest){
        if(!data||data.length==0){
            _this._createDataSource(dsType,dataSourceName);
            return;
        }
        var dsInProject=isc.DataSource.get(dataSourceName)!=null,
            thisUserCreated=(_this.builder.userId==data[0].ownerId),
            message=dsInProject?
                 "DataSource name '"+dataSourceName+"' is already in use. "+
                            "Overwrite the existing DataSource?":
                 (thisUserCreated?
                    "You have already created a DataSource with name '"+dataSourceName+"'. ":
                    "A DataSource with name '"+dataSourceName+"' has been created by another user. ")+
                 "This DataSource is not part of the current project, but may be "+
                 "being used by other projects, in which case overwriting it would impact those other projects. "+
                    "<P>Overwrite the existing DataSource?"
        ;
         isc.warn(message,
        function(value){
            if(value)_this._createDataSource(dsType,dataSourceName);
        },{
            buttons:[
                isc.Dialog.CANCEL,
                {title:"Overwrite",width:75,overflow:"visible",
                  click:function(){this.topElement.okClick();}
                }
            ],
            autoFocusButton:1
        });
    },{
        operationId:"allOwners"
    });
}
,isc.A._createDataSource=function isc_SampleDataDSWizard__createDataSource(dsType,dsName){
    var fileType=this.optionsForm.getValue("inputFormat");
    if(fileType=="Mockup text")fileType="mock";
    var rawData=this.dataForm.getValue("pasteData");
    if(fileType=="CSV"&&rawData&&rawData.startsWith("===")){
        this.logWarn("ignoring your requested DataSource name '"+dsName+
            "' as Reify-specific CSV was autodetected that has embedded DS name metadata");
        this.createDataSourcesFromReifyFormat(rawData);
    }else{
        this._createDataSourceFromData(dsType,fileType,rawData,dsName);
    }
}
,isc.A._createDataSourceFromData=function isc_SampleDataDSWizard__createDataSourceFromData(dsType,fileType,rawData,dsName){
    var _this=this;
    isc.Timer.setTimeout(function(){
        _this.parseData(fileType,rawData,function(parsedData,parsedFields,rawData){
            try{
                var guesser=isc.SchemaGuesser.create({
                        minExampleCount:0,fields:parsedFields
                    }),
                    guessedFields=guesser.extractFieldsFrom(parsedData),
                    guessedRecords=guesser.convertData(parsedData),
                    parseDetails=guesser.parseDetails
                ;
                isc.clearPrompt();
                if(parseDetails&&parseDetails.length>0){
                    var dialog=_this.createAutoChild("parseDetailsDialog",{
                        items:[
                            _this.createAutoChild("parseDetailsMessageLabel"),
                            _this.createAutoChild("errorViewer",{data:parseDetails})
                        ],
                        okClick:function(){
                            this.Super("okClick",arguments);
                            _this.__createDataSource(dsType,fileType,rawData,guessedFields,
                                                     guessedRecords,dsName);
                        },
                        cancelClick:function(){
                            this.Super("cancelClick",arguments);
                        }
                    });
                    dialog.show();
                }else{
                    _this.__createDataSource(dsType,fileType,rawData,guessedFields,
                                             guessedRecords,dsName);
                }
            }catch(e){
                isc.clearPrompt();
                _this.logWarn("Error parsing data: "+e);
                isc.say("Failed to parse data.  Make sure you have the right format selected above!");
            }
        });
    },10);
}
,isc.A._warnOfImportDataTooLarge=function isc_SampleDataDSWizard__warnOfImportDataTooLarge(perData,dsName){
    var maxUploadFileSize=this._maxUploadFileSize;
    if(perData.length>maxUploadFileSize){
        var message=this.importDataTooLargeMessage.evalDynamicString(
            this,{dsId:dsName});
        isc.Notify.addMessage(message,null,null,{
            messagePriority:isc.Notify.WARN
        });
    }
}
,isc.A.createDataSourcesFromReifyFormat=function isc_SampleDataDSWizard_createDataSourcesFromReifyFormat(rawData){
    rawData=rawData.trim();
    var format,
        perData=[],
        dsNames=[],
        tooBigNames=[];
    if(rawData.startsWith("===")){
        this.logInfo("Assuming Reify multi-DS CSV format","dsWizard");
        var splitData=rawData.split(/[\r\n]+\s*(?====)/);
        for(var i=0;i<splitData.length;i++){
            var splitPos=splitData[i].search(/[\r\n]+/),
                csvData=splitData[i].substring(splitPos).trim(),
                dsName=splitData[i].substring(3,splitPos).trim()
            ;
            if(!this._warnOfImportDataTooLarge(csvData,dsName)){
                perData.add(csvData);
                dsNames.add(dsName);
            }
        }
        format="reifyCSV";
    }else if(rawData.startsWith("<MockDataSource")){
        this.logInfo("Assuming Reify multi-DS XML format","dsWizard");
        var splitData=rawData.split(/[\r\n]+\s*(?=<MockDataSource )/);
        for(var i=0;i<splitData.length;i++){
            var xmlData=splitData[i].trim(),
                dsNameMatches=xmlData.match(/^<MockDataSource\s+ID\="([^"]+)"/),
                dsName=(dsNameMatches&&dsNameMatches.length>1?dsNameMatches[1]:null)
            ;
            if(dsName&&!this._warnOfImportDataTooLarge(xmlData,dsName)){
                perData.add(xmlData);
                dsNames.add(dsName);
            }
        }
        format="xmlMockDS";
    }
    if(dsNames.length==0){
        isc.Notify.addMessage(this.reifyExportBadFormatMessage,null,null,{
            messagePriority:isc.Notify.WARN
        });
        return;
    }
    if(this.logIsDebugEnabled("dsWizard")){
        this.logDebug("Found "+dsNames.length+" DataSources: "+dsNames,"dsWizard");
    }
    var internalCollisions=[];
    for(var i=0;i<dsNames.length;i++){
        var dsId=dsNames[i];
        if(dsId.startsWith("isc_")){
            internalCollisions.add(dsId);
        }
    }
    if(internalCollisions.length>0){
        isc.warn("DataSource IDs must not start with 'isc_'. That prefix is reserved for framework DataSources.'<br>"+
                 "The following DataSource"+(internalCollisions.length>1?"s ":" ")+
                 "violate"+(internalCollisions.length==1?"s ":" ")+
                 "that restriction: "+internalCollisions.join(","));
        return;
    }
    var _this=this,
        collisions=[],
        builder=this.builder
    ;
    isc.RPCManager.startQueue();
    for(var i=0;i<dsNames.length;i++){
        var fileSpec={
            fileType:"ds",fileFormat:"xml",fileName:dsNames[i]
        };
        builder.dsDataSource.hasFile(fileSpec,function(dsResponse,data,dsRequest){
            if(data)collisions.add(dsRequest.data.fileName);
        },{
            operationId:"allOwners"
        });
    }
    isc.RPCManager.sendQueue(function(){
        _this._handleCheckDSNamesReply(format,dsNames,perData,collisions);
    });
}
,isc.A._handleCheckDSNamesReply=function isc_SampleDataDSWizard__handleCheckDSNamesReply(format,dsNames,perData,collisions){
    if(!collisions.length){
        return this._createDataSourcesFromData(format,dsNames,perData);
    }
    var message=this.collisionPromptText.evalDynamicString(this,{
        collisions:collisions.join(", ")
    });
    var _this=this;
    isc.Dialog.create({
        title:"DataSource ID Collisions",
        message:message,autoSize:true,
        bodyProperties:{minBreadthMember:1},
        buttons:[{
            title:this.collideDeleteExistingText,disabled:true,autoFit:true
        },{
            title:this.collideImportOnlyNewText,click:function(){
                _this._createDataSourcesFromData(format,dsNames,perData,collisions);
                this.topElement.cancelClick();
            },autoFit:true,disabled:dsNames.length==collisions.length
        },{
            title:this.collideRenameNewDSText,click:function(){
                _this._renameImportedDataSources(format,dsNames,perData,collisions);
                this.topElement.cancelClick();
            },autoFit:true
        },
            isc.Dialog.CANCEL
        ]
    });
}
,isc.A._renameDataSourcesInCSVData=function isc_SampleDataDSWizard__renameDataSourcesInCSVData(perData,renamedCollisions,collisions){
    var remapForeignKeys=function(fieldLine){
        for(var i=0;i<renamedCollisions.length;i++){
            var oldName=collisions[i],
                newName=renamedCollisions[i],
                fkRegex=new RegExp("\\|FK="+oldName+"\.([A-Za-z_]+)","g");
            fieldLine=fieldLine.replace(fkRegex,"|FK="+newName+".$1");
        }
        return fieldLine;
    };
    for(var i=0;i<perData.length;i++){
        perData[i]=perData[i].replace(/^.*/,remapForeignKeys);
    }
}
,isc.A._renameDataSourcesInXMLData=function isc_SampleDataDSWizard__renameDataSourcesInXMLData(dsConfig,renamedCollisions,collisions){
    var ID=dsConfig.ID,
        fields=dsConfig.fields,
        keys=["foreignKey","includeFrom"]
    ;
    for(var i=0;i<collisions.length;i++){
        var oldName=collisions[i],
            newName=renamedCollisions[i],
            matchEx=new RegExp("^(.*\\.)?"+oldName+"(\\..*)$")
        ;
        if(oldName==ID)dsConfig.ID=newName;
        for(var j=0;j<fields.length;j++){
            var field=fields[j];
            for(var k=0;k<keys.length;k++){
                var value=field[keys[k]];
                if(value)field[keys[k]]=value.replace(matchEx,"$1"+newName+"$2");
            }
        }
    }
}
,isc.A._renameImportedDataSources=function isc_SampleDataDSWizard__renameImportedDataSources(format,dsNames,perData,collisions){
    var _this=this;
    isc.DataSourceRenameDSWizard.create({
        builder:this.builder,
        allDsNames:collisions,
        showCollisionApproach:false,
        collidingDsNames:collisions,
        collisionBlurbProperties:{
            contents:"Click 'OK' to rename the listed DataSources as shown before importing.  You can make any desired changes first."
        },
        renameCallback:function(renamedCollisions){
            var fixRefsCallback;
            if(format=="reifyCSV"){
                _this._renameDataSourcesInCSVData(perData,renamedCollisions,collisions);
            }else{
                fixRefsCallback=function(dsConfig){
                    _this._renameDataSourcesInXMLData(dsConfig,renamedCollisions,collisions);
                };
            }
            for(var i=0;i<dsNames.length;i++){
                var dsName=dsNames[i],
                    collisionIndex=collisions.indexOf(dsName);
                if(collisionIndex>=0){
                    dsNames[i]=renamedCollisions[collisionIndex];
                }
            }
            _this._createDataSourcesFromData(format,dsNames,perData,null,fixRefsCallback);
        }
    });
}
,isc.A._createDataSourcesFromData=function isc_SampleDataDSWizard__createDataSourcesFromData(format,dsNames,perData,skipList,xmlCallback){
    var xmlWizard;
    for(var i=0;i<dsNames.length;i++){
        var dsName=dsNames[i];
        if(skipList&&skipList.contains(dsName))continue;
        if(this.logIsDebugEnabled("dsWizard")){
            this.logDebug("creating DS "+dsName+" from imported data");
        }
        if(format=="reifyCSV"){
            this._createDataSourceFromData("MockDataSource","CSV",perData[i],dsName);
        }else{
            if(!xmlWizard){
                xmlWizard=isc.XMLCodeDSWizard.create({
                    visibility:"hidden",
                    builder:this.builder
                });
            }
            xmlWizard.addDataSourceFromXML(perData[i],{
                fixConfigCallback:xmlCallback,
                guesserProperties:{
                    keepFieldOrder:true
                },
                detectFieldTypes:true
            },dsName);
        }
    }
    this.hide();
}
,isc.A.__createDataSource=function isc_SampleDataDSWizard___createDataSource(dsType,fileType,rawData,guessedFields,guessedRecords,dataSourceName){
    var dsProperties={},
        ds;
    if(dsType=="MockDataSource"){
        isc.addProperties(dsProperties,{
            ID:dataSourceName,
            mockData:rawData,
            mockDataFormat:fileType.toLowerCase()
        });
        ds=isc.MockDataSource.create(dsProperties,{sourceDataSourceID:this.builder.dsDataSource.ID});
        this._paletteNode.wizardDefaults.showDSEditor="false";
    }else{
        if(dsType=="SQLDataSource"||dsType=="HibernateDataSource"){
            isc.addProperties(dsProperties,{
                ID:dataSourceName,
                serverType:dsType=="SQLDataSource"?"sql":"hibernate",
                fields:guessedFields
            });
        }
        ds=isc.DataSource.create(dsProperties,{sourceDataSourceID:this.builder.dsDataSource.ID});
        this._paletteNode.wizardDefaults.importData={
            fileType:fileType,
            rawData:rawData,
            guessedRecords:guessedRecords
        };
    }
    this._paletteNode.defaults=ds;
    this.fireCallback(this._getResultsCallback,"node",[this._paletteNode]);
    this.hide();
}
,isc.A.parseData=function isc_SampleDataDSWizard_parseData(fileType,rawData,callback){
    var testData=rawData?rawData.trim():"",
        _this=this;
    if(fileType=="JSON"&&!testData.startsWith("[")){
        isc.confirm("You have specified input format 'JSON', but the sample data does not look like "+
                    "JSON.  Continue anyway?",function(value){
                        if(value)_this._parseData(fileType,rawData,callback);
                    });
    }else if(fileType=="XML"&&!testData.startsWith("<")){
        isc.confirm("You have specified input format 'XML', but the sample data does not look like "+
                "XML.  Continue anyway?",function(value){
                    if(value)_this._parseData(fileType,rawData,callback);
                });
    }else if(fileType!="JSON"&&testData.startsWith("[")){
        isc.confirm("The sample data looks like JSON but you have specified a different input format. "+
                    "Continue anyway?",function(value){
                        if(value)_this._parseData(fileType,rawData,callback);
                    });
    }else if(fileType!="XML"&&testData.startsWith("<")){
        isc.confirm("The sample data looks like XML but you have specified a different input format. "+
                    "Continue anyway?",function(value){
                        if(value)_this._parseData(fileType,rawData,callback);
                    });
    }else{
        this._parseData(fileType,rawData,callback);
    }
}
,isc.A._parseData=function isc_SampleDataDSWizard__parseData(fileType,rawData,callback){
    isc.showPrompt("Analyzing sample data...");
    var _this=this;
    var parse=function(data){
        var parsedData,
            parsedFields
        ;
        var parser=isc.FileParser.create({hasHeaderLine:true});
        if(fileType=="JSON"||fileType=="XML"){
            parsedData=parser.parseJsonData(data);
            if(parsedData._parseFailure){
                isc.clearPrompt();
                return;
            }
            if(parsedData._notAnArray){
                isc.warn("Parsing error: expected a list of items",function(){
                    isc.clearPrompt();
                });
                return;
            }
        }else if(fileType=="CSV"){
            parsedData=parser.parseCsvData(data);
            rawData=parser.getFilteredCsvData();
        }
        parsedFields=parser.getFields();
        callback(parsedData,parsedFields,rawData);
    };
    if(fileType=="XML"){
        var xmlData=isc.xml.parseXML(rawData);
        var elements=isc.xml.selectNodes(xmlData,"/"),
            jsElements=isc.xml.toJS(elements)
        ;
        if(jsElements.length==1){
            var encoder=isc.JSONEncoder.create({dateFormat:"dateConstructor",prettyPrint:false});
            var json=encoder.encode(jsElements[0]);
            var err=this.xmlParserError(isc.JSON.decode(json));
            if(err){
                isc.warn("XML parser error: "+err,function(){
                    isc.clearPrompt();
                });
                return;
            }
            parse(json);
        }
    }else if(fileType=="mock"){
        callback(rawData,rawData,rawData);
    }else{
        parse(rawData);
    }
}
,isc.A.xmlParserError=function isc_SampleDataDSWizard_xmlParserError(obj,parserErrorSeen){
    if(!isc.isAn.Object(obj)||isc.isAn.Array(obj))return;
    for(var attr in obj){
        if(attr=="parsererror"){
            parserErrorSeen=true;
        }
        if(attr=="xmlTextContent"&&parserErrorSeen){
            return obj[attr];
        }
        var subErr=this.xmlParserError(obj[attr],parserErrorSeen);
        if(subErr)return subErr;
    }
}
,isc.A.importedData=function isc_SampleDataDSWizard_importedData(data,fileName){
    if(fileName)this.updateInputFormatFromFileName(fileName);
    this.dataForm.setValue("pasteData",data);
}
,isc.A.inputFormatChanged=function isc_SampleDataDSWizard_inputFormatChanged(){
    var fileType=this.optionsForm.getValue("inputFormat"),
        accept;
    if(fileType!="Mockup text"){
        accept=this.acceptedFileTypes[fileType];
    }
    var field=this.optionsForm.getItem("import");
    field.setAccept(accept);
    if(fileType=="Reify Export"){
        this.optionsForm.clearValue("dataSourceName");
    }
    this._updateMaxUploadFileSize();
}
,isc.A.updateInputFormatFromFileName=function isc_SampleDataDSWizard_updateInputFormatFromFileName(fileName){
    fileName=fileName.toLowerCase();
    var inputFormat;
    if(fileName.endsWith(".csv")){
        inputFormat="CSV";
    }else if(fileName.match(/\.reify\s*(\([0-9]+\))?\.xml/)){
        inputFormat="Reify Export";
    }else if(fileName.endsWith(".xml")){
        inputFormat="XML";
    }else if(fileName.endsWith(".json")){
        inputFormat="JSON";
    }
    if(inputFormat){
        this.optionsForm.setValue("inputFormat",inputFormat);
        this.optionsForm.validate();
        this.inputFormatChanged();
    }
}
,isc.A.enableImportButton=function isc_SampleDataDSWizard_enableImportButton(){
    this.optionsForm.getItem("import").enableImport();
}
,isc.A.importFileClick=function isc_SampleDataDSWizard_importFileClick(){
    var dataForm=this.dataForm;
    if(this.optionsForm.getValue("file")==null)return;
    this.optionsForm.saveData(function(response,data,request){
        dataForm.setValue("pasteData",data.file);
    });
}
,isc.A.getResults=function isc_SampleDataDSWizard_getResults(newNode,callback,palette){
    this._getResultsCallback=callback;
    if(newNode.wizardDefaults){
        newNode=isc.addProperties({},newNode);
        newNode.wizardDefaults=isc.addProperties({},newNode.wizardDefaults);
    }
    this._paletteNode=newNode;
    this._updateMaxUploadFileSize();
}
,isc.A._updateMaxUploadFileSize=function isc_SampleDataDSWizard__updateMaxUploadFileSize(){
    var maxSize=this._paletteNode.wizardDefaults.maxUploadFileSize;
    if(maxSize!=null&&isc.isA.String(maxSize)){
        maxSize=maxSize.asDataSizeBytes();
        if(maxSize==0)maxSize=null;
    }
    this._maxUploadFileSize=maxSize;
    if(maxSize==null)return;
    var form=this.optionsForm,
        fileType=form.getValue("inputFormat");
    if(fileType=="Reify Export")maxSize*=isc.Reify.dsScalingFactor;
    form.getItem("import").setMaxFileSize(maxSize,this.importFileTooLargeMessage);
    var fields=[isc.addProperties({},this.pasteDataFieldDefaults,{
        length:maxSize
    })];
    this.dataForm.setFields(fields);
}
);
isc.B._maxIndex=isc.C+23;

isc.ClassFactory.defineClass("UploadSampleDataItem","CanvasItem");
isc.A=isc.UploadSampleDataItem.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.width="*";
isc.A.canvasConstructor=isc.DynamicForm;
isc.A.canvasProperties={
        autoDraw:false,
        dataSource:"SCUploadSaveFile",
        width:"100%",
        numCols:2,
        colWidths:[250,"*"],
        init:function(){
            var disabledImportButton=(this.disabledImportButton==null?true:this.disabledImportButton);
            this.fields=[
                {
                    name:"file",
                    editorType:isc.TFileItem||isc.FileItem,
                    showTitle:false,
                    width:"*",
                    multiple:false,
                    validators:this.fileValidators,
                    accept:this.accept
                },
                {
                    name:"file_dir",
                    type:"HiddenItem",
                    defaultValue:"[READ_ONLY]"
                },
                {
                    name:"importButton",
                    type:"button",
                    title:"Import",
                    startRow:false,
                    disabled:disabledImportButton,
                    click:function(){
                        this.form.creator.importFileClick();
                    }
                }
            ];
            this.Super("init",arguments);
        }
    };
isc.B.push(isc.A.enableImport=function isc_UploadSampleDataItem_enableImport(){
        this.disabledImportButton=false;
        this.canvas.getItem("importButton").enable();
    }
,isc.A.setAccept=function isc_UploadSampleDataItem_setAccept(accept){
        this.accept=accept;
        this.setCanvas(null);
    }
,isc.A.setMaxFileSize=function isc_UploadSampleDataItem_setMaxFileSize(size,errorMessage){
        this.fileValidators=null;
        if(size!=null&&size>0){
            this.fileValidators=[
                {type:"maxFileSize",maxFileSize:size,errorMessage:errorMessage}
            ];
        }
        this.setCanvas(null);
    }
,isc.A.createCanvas=function isc_UploadSampleDataItem_createCanvas(){
        return this.createAutoChild("canvas",{
            disabledImportButton:this.disabledImportButton,
            accept:this.accept,
            fileValidators:this.fileValidators
        });
    }
,isc.A.importFileClick=function isc_UploadSampleDataItem_importFileClick(){
        var _this=this;
        if(this.canvas.getValue("file")==null)return;
        this.canvas.saveData(function(response,data,request){
            if(_this.importedData)_this.importedData(data.file,data.file_filename);
            _this.canvas.clearValues();
        });
    }
);
isc.B._maxIndex=isc.C+5;

isc.defineClass("XMLCodeDSWizard","Window");
isc.A=isc.XMLCodeDSWizard.getPrototype();
isc.A.orientation="vertical";
isc.A.title="Add DataSource from XML Code";
isc.A.width="85%";
isc.A.height="85%";
isc.A.isModal=true;
isc.A.showModalMask=true;
isc.A.canDragResize=true;
isc.A.importFileTooLargeMessage="Please provide a smaller DataSource definition. Deployed applications do not have such limits on definition size.";
isc.A.outerLayoutDefaults={
        _constructor:isc.VLayout,
        autoParent:"body",
        autoDraw:false,
        width:"100%",height:"100%",
        overflow:"hidden",
        padding:3
    };
isc.A.optionsFormDefaults={
        _constructor:isc.DynamicForm,
        autoParent:"outerLayout",
        autoDraw:false,
        dataSource:"SCUploadSaveFile",
        width:"100%",
        height:10,
        numCols:3,
        colWidths:[150,300,"*"],
        cellPadding:5,
        fields:[
            {
                type:"blurb",
                defaultValue:"Choose a DataSource file to import or paste the XML source into the field below"
            },
            {
                name:"import",
                editorType:"UploadSampleDataItem",
                showTitle:false,
                width:"*",
                shouldSaveValue:false,
                accept:"text/xml",
                importedData:function(data,fileName){
                    this.form.creator.importedXMLCode(data,fileName);
                }
            }
        ]
    };
isc.A.dataFormDefaults={
        _constructor:isc.DynamicForm,
        autoParent:"outerLayout",
        autoDraw:false,
        width:"100%",
        height:"*",
        numCols:1,
        autoFocus:true,
        parentResized:function(skipResolve){
            this.Super("parentResized",arguments);
            this.markForRedraw();
        }
    };
isc.A.pasteCodeFieldDefaults={
        name:"pasteCode",
        type:"TextAreaItem",
        showTitle:false,
        width:"*",
        height:"*",
        hint:"Type or paste XML definition here",
        showHintInField:true,
        browserSpellCheck:false
    };
isc.A.buttonLayoutDefaults={
        _constructor:isc.HLayout,
        autoParent:"outerLayout",
        autoDraw:false,
        width:"100%",height:35,
        padding:5,
        membersMargin:10,
        align:"right"
    };
isc.A.cancelButtonDefaults={
        _constructor:isc.IButton,
        autoParent:"buttonLayout",
        autoDraw:false,
        title:"Cancel",
        width:75,
        click:function(){
            this.creator.closeClick();
            this.creator.markForDestroy();
        }
    };
isc.A.addDataSourceButtonDefaults={
        _constructor:isc.IButton,
        autoParent:"buttonLayout",
        autoDraw:false,
        title:"Add DataSource",
        click:function(){
            this.creator.addDataSourceClick(this.creator.targetDSType);
        }
    }
;

isc.A=isc.XMLCodeDSWizard.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.B.push(isc.A.destroy=function isc_XMLCodeDSWizard_destroy(){
    this.Super("destroy",arguments);
    if(this.uploadDialog)this.uploadDialog.destroy();
}
,isc.A.createChildren=function isc_XMLCodeDSWizard_createChildren(){
    this.Super("createChildren");
    this.body.hPolicy="fill";
    this.body.vPolicy="fill";
    var dataFormProperties={fields:[isc.addProperties({},this.pasteCodeFieldDefaults)]};
    this.addAutoChild("outerLayout");
    this.addAutoChild("optionsForm");
    this.addAutoChild("dataForm",dataFormProperties);
    this.addAutoChild("buttonLayout");
    this.addAutoChild("cancelButton");
    this.addAutoChild("addDataSourceButton");
    var scUploadSaveFileDS=isc.DataSource.get("SCUploadSaveFile"),
        _this=this
    ;
    scUploadSaveFileDS.performCustomOperation("checkUploadFeature",null,
        function(response,data){
            if(response.status==isc.RPCResponse.STATUS_SUCCESS){
                _this.enableImportButton();
            }
        },
        {willHandleError:true}
    );
}
,isc.A.addDataSourceFromXML=function isc_XMLCodeDSWizard_addDataSourceFromXML(rawCode,importContext,renamedID){
    var _this=this;
    isc.showPrompt("Analyzing DataSource definition...");
    this._extractDSTypeAndId(rawCode,function(dsType,dsId){
        if(!dsType||!dsId){
            isc.clearPrompt();
            return;
        }
        if(renamedID)dsId=renamedID;
        if(dsId.startsWith("isc_")){
            isc.warn("DataSource ID must not start with 'isc_'. That prefix is reserved for framework DataSources.'");
            isc.clearPrompt();
            return;
        }
        _this._parseCode(dsType,dsId,rawCode,function(defaults){
            var fileSpec={
                fileName:dsId,
                fileType:"ds",
                fileFormat:"xml"
            };
            _this.builder.dsDataSource.hasFile(fileSpec,function(dsResponse,data,dsRequest){
                isc.clearPrompt();
                if(!data){
                    _this._addDataSource(dsType,defaults,importContext);
                    return;
                }
                isc.warn("DataSource name '"+dsId+"' is already in use. "+
                            "Overwrite the existing DataSource?",
                function(value){
                    if(value)_this._addDataSource(dsType,defaults,importContext);
                },{
                    buttons:[
                        isc.Dialog.CANCEL,
                        {title:"Overwrite",width:75,overflow:"visible",
                        click:function(){this.topElement.okClick();}
                        }
                    ],
                    autoFocusButton:1
                });
            },{
                operationId:"allOwners"
            });
        });
    });
}
,isc.A.addDataSourceClick=function isc_XMLCodeDSWizard_addDataSourceClick(){
    if(!this.optionsForm.validate()||!this.dataForm.validate()){
        return;
    }
    var rawCode=this.dataForm.getValue("pasteCode");
    if(rawCode==null){
        isc.say("No XML definition has been entered or uploaded.",null,{
            title:"Missing required field",
            icon:"[SKINIMG]Dialog/error.png"
        });
        return;
    }
    var code=(rawCode?rawCode.trim():"");
    if(!code.startsWith("<")){
        isc.say("The DataSource definition does not look like XML",null,{
            title:"Invalid DataSource definition",
            icon:"[SKINIMG]Dialog/error.png"
        });
        return;
    }
    this.addDataSourceFromXML(rawCode);
}
,isc.A._extractDSTypeAndId=function isc_XMLCodeDSWizard__extractDSTypeAndId(rawCode,callback){
    var xmlData=isc.xml.parseXML(rawCode),
        objects=xmlData&&isc.xml.selectObjects(xmlData,"/"),
        dsType=objects&&objects[0]&&objects[0].documentElement.localName,
        clazz=dsType&&isc.ClassFactory.getClass(dsType)
    ;
    if(!clazz||!clazz.isA("DataSource")){
        isc.warn("Invalid DataSource defintion: DataSource type or ID could not be determined."+
                 "<p>Check your XML below.");
        callback();
    }
    var elements=isc.xml.selectNodes(xmlData,"/"),
        jsElements=isc.xml.toJS(elements),
        dsId
    ;
    if(jsElements.length==1){
        var encoder=isc.JSONEncoder.create({dateFormat:"dateConstructor",prettyPrint:false}),
            json=encoder.encode(jsElements[0]),
            js=isc.JSON.decode(json),
            err=this.xmlParserError(js)
        ;
        if(err){
            isc.warn("Invalid DataSource defintion XML. Parser error: "+err);
        }else{
            dsId=js.ID;
        }
    }else{
        isc.warn("Invalid DataSource defintion: DataSource type or ID could not be determined."+
                 "<p>Check your XML below.");
    }
    callback(dsType,dsId);
}
,isc.A._parseCode=function isc_XMLCodeDSWizard__parseCode(dsType,dsId,rawCode,callback){
    var _this=this;
    isc.DMI.callBuiltin({
        methodName:"xmlToJS",
        arguments:[rawCode],
        callback:function(rpcResponse,data){
            var existingDS=window[dsId];
            isc.ClassFactory._setVBLoadingDataSources(true);
            isc.captureDefaults=true;

            var dsComponent=isc.eval(data);
            isc.captureDefaults=null;
            isc.capturedComponents=null;
            window[dsComponent.defaults.ID]=existingDS;
            isc.ClassFactory._setVBLoadingDataSources(null);
            dsComponent.defaults._constructor=dsType;
            callback(dsComponent.defaults);
        }
    });
}
,isc.A._finalizeImportedMockXML=function isc_XMLCodeDSWizard__finalizeImportedMockXML(defaults,importContext){
    defaults.fields=isc.MockDataSource.detectFieldTypes(
        defaults.fields,defaults.cacheData,importContext,defaults);
    var callback=importContext.fixConfigCallback;
    this.fireCallback(callback,"defaults",[defaults]);
}
,isc.A._addDataSource=function isc_XMLCodeDSWizard__addDataSource(dsType,defaults,importContext){
    var dsClass=dsType;
    var schema;
    if(isc.DS.isRegistered(dsClass)){
        schema=isc.DS.get(dsClass);
    }else{
        schema=isc.DS.get("DataSource");
    }
    if(importContext)this._finalizeImportedMockXML(defaults,importContext);
    var xml=schema.xmlSerialize(defaults);
    var _this=this,
        dsDataSource=this.builder.dsDataSource;
    dsDataSource.saveFile({
        fileName:defaults.ID,
        fileType:"ds",
        fileFormat:"xml"
    },xml,function(){
        isc.ClassFactory.getClass(dsClass).create(defaults,{
            sourceDataSourceID:dsDataSource.ID
        });
        _this.builder.project.addDatasource(defaults.ID,dsType);
        _this.hide();
        _this.builder.dataSourceWizardComplete(defaults.ID);
    });
}
,isc.A.xmlParserError=function isc_XMLCodeDSWizard_xmlParserError(obj,parserErrorSeen){
    if(!isc.isAn.Object(obj)||isc.isAn.Array(obj))return;
    for(var attr in obj){
        if(attr=="parsererror"){
            parserErrorSeen=true;
        }
        if(attr=="xmlTextContent"&&parserErrorSeen){
            return obj[attr];
        }
        var subErr=this.xmlParserError(obj[attr],parserErrorSeen);
        if(subErr)return subErr;
    }
}
,isc.A.importedXMLCode=function isc_XMLCodeDSWizard_importedXMLCode(data,fileName){
    this.dataForm.setValue("pasteCode",data);
}
,isc.A.enableImportButton=function isc_XMLCodeDSWizard_enableImportButton(){
    this.optionsForm.getItem("import").enableImport();
}
,isc.A.importFileClick=function isc_XMLCodeDSWizard_importFileClick(){
    var dataForm=this.dataForm;
    if(this.optionsForm.getValue("file")==null)return;
    this.optionsForm.saveData(function(response,data,request){
        dataForm.setValue("pasteCode",data.file);
    });
}
,isc.A.getResults=function isc_XMLCodeDSWizard_getResults(newNode,callback,palette){
    this._getResultsCallback=callback;
    if(newNode.wizardDefaults){
        newNode=isc.addProperties({},newNode);
        newNode.wizardDefaults=isc.addProperties({},newNode.wizardDefaults);
    }
    this._paletteNode=newNode;
    this._updateMaxUploadFileSize();
}
,isc.A._updateMaxUploadFileSize=function isc_XMLCodeDSWizard__updateMaxUploadFileSize(){
    var maxSize=this._paletteNode.wizardDefaults.maxUploadFileSize;
    if(maxSize!=null&&isc.isA.String(maxSize)){
        maxSize=maxSize.asDataSizeBytes();
        if(maxSize==0)maxSize=null;
    }
    this._maxUploadFileSize=maxSize;
    if(maxSize==null)return;
    var form=this.optionsForm,
        fileType=form.getValue("inputFormat");
    if(fileType=="Reify Export")maxSize*=isc.Reify.dsScalingFactor;
    form.getItem("import").setMaxFileSize(maxSize,this.importFileTooLargeMessage);
    var fields=[isc.addProperties({},this.pasteCodeFieldDefaults,{
        length:maxSize
    })];
    this.dataForm.setFields(fields);
}
);
isc.B._maxIndex=isc.C+14;

isc.defineClass("BasicFieldsDSWizard");
isc.BasicFieldsDSWizard.addProperties({
})
isc.A=isc.BasicFieldsDSWizard.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.B.push(isc.A.showDSEditor=function isc_BasicFieldsDSWizard_showDSEditor(){
    var node=this._paletteNode;
    node.wizardDefaults.dsEditorProperties={
        editMockData:false
    };
    if(this.autoAddPK)node.wizardDefaults.dsEditorProperties.autoAddPK=(this.autoAddPK!="false");
    if(this.requirePK)node.wizardDefaults.dsEditorProperties.requirePK=(this.requirePK!="false");
    if(this.canSelectPrimaryKey)node.wizardDefaults.dsEditorProperties.canSelectPrimaryKey=(this.canSelectPrimaryKey!="false");
    if(this.canAddChildSchema)node.wizardDefaults.dsEditorProperties.canAddChildSchema=(this.canAddChildSchema!="false");
    if(this.showMoreButton)node.wizardDefaults.dsEditorProperties.showMoreButton=(this.showMoreButton!="false");
    if(this.showLegalValuesButton)node.wizardDefaults.dsEditorProperties.showLegalValuesButton=(this.showLegalValuesButton.toLowerCase()=="true");
    this.fireCallback(this._getResultsCallback,"node",[node]);
}
,isc.A.getResults=function isc_BasicFieldsDSWizard_getResults(newNode,callback,palette){
    this._getResultsCallback=callback;
    if(newNode.wizardDefaults){
        newNode=isc.addProperties({},newNode);
        newNode.wizardDefaults=isc.addProperties({},newNode.wizardDefaults);
    }
    var dsProperties=isc.addProperties({},{
        _constructor:this.targetDSType
    });
    newNode.defaults=dsProperties;
    this._paletteNode=newNode;
    this.delayCall("showDSEditor");
}
);
isc.B._maxIndex=isc.C+2;

isc.defineClass("SampleDataSourceDSWizard","Window");
isc.A=isc.SampleDataSourceDSWizard.getPrototype();
isc.A.autoCenter=true;
isc.A.autoParent=false;
isc.A.showCloseButton=true;
isc.A.showMinimizeButton=false;
isc.A.isModal=true;
isc.A.showModalMask=true;
isc.A.title="Add Sample DataSources";
isc.A.bodyProperties={overflow:"visible"};
isc.A.overflow="visible";
isc.A.labelContent="This will add a set of interconnected sample DataSources representing a simple "+
        "order fulfillment database.<br><br>"+
        "You can freely modify these DataSources and their data after adding them to your project."
;

isc.A=isc.SampleDataSourceDSWizard.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.B.push(isc.A.initWidget=function isc_SampleDataSourceDSWizard_initWidget(){
        this.Super("initWidget",arguments);
        this.setWidth(470);
        this.setHeight(170);
        var that=this;
        var ok=isc.Button.create({
            title:"OK",
            click:function(){
                that.addSampleDataSources();
                that.close();
            }
        });
        var cancel=isc.Button.create({
            title:"Cancel",
            click:function(){
                that.close();
            }
        });
        var buttonLayout=isc.HLayout.create({
            padding:5,
            membersMargin:10,
            align:"right",
            members:[cancel,ok]
        });
        var label=isc.Label.create({
            width:"100%",
            padding:15,
            contents:this.labelContent
        });
        this.addItem(label);
        this.addItem(buttonLayout);
    }
,isc.A.showDSEditor=function isc_SampleDataSourceDSWizard_showDSEditor(){
    }
,isc.A.getResults=function isc_SampleDataSourceDSWizard_getResults(newNode,callback,palette){
    }
,isc.A.addSampleDataSources=function isc_SampleDataSourceDSWizard_addSampleDataSources(){
        var _this=this;
        this.builder.verifySampleDataSources(function(allSamples,missingSamples,actualSamplesPresent){
            if(allSamples.length==missingSamples.length){
                _this.builder.addDataSourcesToProject(true,true);
                return;
            }
            var collidingSamples=[];
            for(var i=0;i<allSamples.length;i++){
                if(!missingSamples.contains(allSamples[i])){
                    collidingSamples.add(allSamples[i]);
                }
            }
            if(collidingSamples.length>actualSamplesPresent.length){
                _this.showCollisionDialog(allSamples,collidingSamples);
            }else{
                var proj=_this.builder.project;
                var addToProject=[],importToSandbox=[];
                for(var i=0;i<actualSamplesPresent.length;i++){
                    if(proj.datasources.findIndex("dsName",actualSamplesPresent[i])==-1){
                        addToProject.add(actualSamplesPresent[i]);
                    }else{
                        importToSandbox.add(actualSamplesPresent[i]);
                    }
                }
                for(var i=0;i<addToProject.length;i++){
                    proj.addDatasource(addToProject[i]);
                }
                if(importToSandbox.length>0){
                    _this.showCollisionDialog(allSamples,importToSandbox);
                }
            }
        });
    }
,isc.A.showCollisionDialog=function isc_SampleDataSourceDSWizard_showCollisionDialog(allSamples,collidingSamples){
        this.collisionDialog=isc.DataSourceRenameDSWizard.create({
            builder:this.builder,
            allDsNames:allSamples,
            collidingDsNames:collidingSamples
        });
        this.collisionDialog.show();
    }
);
isc.B._maxIndex=isc.C+5;

isc.defineClass("DataSourceRenameDSWizard","Window");
isc.A=isc.DataSourceRenameDSWizard.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.autoCenter=true;
isc.A.autoSize=true;
isc.A.isModal=true;
isc.A.showModalMask=true;
isc.A.width=400;
isc.A.height=300;
isc.A.title="DataSource Name Conflict";
isc.A.backgroundColor="white";
isc.A.collisionDialogContentHolderConstructor="VStack";
isc.A.collisionDialogContentHolderDefaults={
        width:"100%",
        height:"100%",
        padding:10,
        membersMargin:15
    };
isc.A.collisionBlurbConstructor="Canvas";
isc.A.collisionBlurbDefaults={
        autoParent:"collisionDialogContentHolder",
        width:"100%",
        height:1,
        padding:5,
        contents:"Some of your DataSources conflict with the names of the sample DataSources"
    };
isc.A.collisionApproachConstructor="DynamicForm";
isc.A.collisionApproachDefaults={
        autoParent:"collisionDialogContentHolder",
        width:"100%",
        height:1,
        numCols:1,
        fields:[
            {name:"approach",vertical:false,showTitle:false,width:"*",editorType:"RadioGroupItem",valueMap:{
                fixMine:"Rename my existing DataSources",
                fixTheirs:"Add all the sample DataSources with a matching suffix"
            },changed:function(form,item,value){
                form.creator._setCollisionApproach(value);
            }}
        ]
    };
isc.A.collisionMyItemsLayoutConstructor="VStack";
isc.A.collisionMyItemsLayoutDefaults={
        autoParent:"collisionDialogContentHolder",
        width:"100%",
        height:1,
        visibility:"hidden"
    };
isc.A.collisionMyItemConstructor="DynamicForm";
isc.A.collisionMyItemDefaults={
        width:"100%",
        height:1,
        numCols:3,
        fields:[
            {name:"oldName",showTitle:false,editorType:"StaticTextItem"},
            {editorType:"CanvasItem",showTitle:false,canvasConstructor:"Img",
                    canvasDefaults:{src:"visit.png",size:24}},
            {name:"newName",showTitle:false,type:"text"}
        ]
    };
isc.A.collisionTheirItemsLayoutConstructor="VStack";
isc.A.collisionTheirItemsLayoutDefaults={
        autoParent:"collisionDialogContentHolder",
        width:"100%",
        height:1,
        visibility:"hidden"
    };
isc.A.collisionTheirItemConstructor="DynamicForm";
isc.A.collisionTheirItemDefaults={
        width:"100%",
        height:1,
        colWidths:[1,"*"],
        errorOrientation:"right",
        fields:[
            {name:"baseName",showTitle:false,editorType:"StaticTextItem"},
            {name:"suffix",showTitle:false,width:50,type:"text",textBoxStyle:"dsNameCollisionSuffix",
                required:true,validateOnChange:true,
                changed:function(form,item,value){
                    form.creator.collisionSuffixChanged(value);
                }
            }
        ]
    };
isc.A.collisionTheirOtherItemsConstructor="DynamicForm";
isc.A.collisionTheirOtherItemsDefaults={
        width:"100%",
        numCols:2,
        colWidths:[1,"*"],
        errorOrientation:"right",
        height:1
    };
isc.A.collisionBlurb2Constructor="Canvas";
isc.A.collisionBlurb2Defaults={
        autoParent:"collisionDialogContentHolder",
        width:"100%",
        height:1,
        padding:5,
        visibility:"hidden",
        contents:"Note: the added sample DataSources will be created with working relations "+
                    "(for example, Orders are related to Customers) using the modified name"
    };
isc.A.collisionButtonsLayoutConstructor="HLayout";
isc.A.collisionButtonsLayoutDefaults={
        autoParent:"collisionDialogContentHolder",
        width:"100%",
        height:1,
        margin:10,
        visibility:"hidden",
        membersMargin:10
    };
isc.A.collisionButtonsLayoutSpringConstructor="LayoutSpacer";
isc.A.collisionButtonsLayoutSpringDefaults={
        autoParent:"collisionButtonsLayout",
        width:"*"
    };
isc.A.collisionOKButtonConstructor="Button";
isc.A.collisionOKButtonDefaults={
        autoParent:"collisionButtonsLayout",
        width:80,
        title:"OK",
        click:function(){
            this.creator.collisionOKClicked();
        }
    };
isc.A.collisionCancelButtonConstructor="Button";
isc.A.collisionCancelButtonDefaults={
        autoParent:"collisionButtonsLayout",
        width:80,
        title:"Cancel",
        click:function(){
            this.creator.collisionCancelClicked();
        }
    };
isc.B.push(isc.A._setCollisionApproach=function isc_DataSourceRenameDSWizard__setCollisionApproach(value){
        if(value=="fixMine"){
            this.collisionMyItemsLayout.show();
            this.collisionTheirItemsLayout.hide();
            this.collisionBlurb2.hide();
        }else{
            this.collisionMyItemsLayout.hide();
            this.collisionTheirItemsLayout.show();
            this.collisionBlurb2.show();
        }
        this.collisionButtonsLayout.show();
    }
,isc.A.initWidget=function isc_DataSourceRenameDSWizard_initWidget(){
        this.Super("initWidget",arguments);
        this.addAutoChild("collisionDialogContentHolder");
        this.addAutoChild("collisionBlurb");
        this.addAutoChild("collisionApproach");
        this.addAutoChild("collisionMyItemsLayout");
        this.addAutoChild("collisionTheirItemsLayout");
        this.addAutoChild("collisionBlurb2");
        this.addAutoChild("collisionButtonsLayout");
        this.addAutoChild("collisionButtonsLayoutSpring");
        this.addAutoChild("collisionCancelButton");
        this.addAutoChild("collisionOKButton");
        if(!this.collisionApproach)this._setCollisionApproach("fixMine");
        this.collisionMyItems=[];
        for(var i=0;i<this.collidingDsNames.length;i++){
            this.collisionMyItems[i]=this.createAutoChild("collisionMyItem");
        }
        this.collisionMyItemsLayout.setMembers(this.collisionMyItems);
        this.collisionTheirItems=[];
        this.collisionTheirItems[0]=this.createAutoChild("collisionTheirItem");
        var otherFields=[];
        for(var i=1;i<this.allDsNames.length;i++){
            otherFields.add({name:"name"+i,editorType:"StaticTextItem",
                             showTitle:false,startRow:true});
        }
        this.collisionTheirItems[1]=this.createAutoChild("collisionTheirOtherItems",
                                                           {fields:otherFields});
        this.collisionTheirItemsLayout.setMembers(this.collisionTheirItems);
        this.doUniqueQueries(otherFields);
    }
,isc.A.doUniqueQueries=function isc_DataSourceRenameDSWizard_doUniqueQueries(otherFields){
        var _this=this,
            collidingNames=this.collidingDsNames
        ;
        if(!this.collisionApproach){
            this.builder.dsDataSource.performCustomOperation("findCommonUniqueSuffix",
                    {nameSet:collidingNames},function(resp,data){
                for(var i=0;i<collidingNames.length;i++){
                    var record={
                        oldName:collidingNames[i],
                        newName:collidingNames[i]+"_"+data
                    };
                    _this.collisionMyItems[i].editRecord(record);
                }
            });
            return;
        }
        isc.RPCManager.startQueue();
        this.builder.dsDataSource.performCustomOperation("findCommonUniqueSuffix",
                {nameSet:this.allDsNames},function(resp,data){
            _this.collisionTheirItems[0].editRecord({baseName:_this.allDsNames[0]+"_",
                                                     suffix:data});
            var record={};
            for(var i=0;i<otherFields.length;i++){
                record["baseName"+(i+1)]=_this.allDsNames[i+1];
                record["name"+(i+1)]=_this.allDsNames[i+1]+"_"+data;
            }
            _this.collisionTheirItems[1].editRecord(record);
        });
        this.builder.dsDataSource.performCustomOperation("findUniqueSuffixes",
                {nameSet:collidingNames},function(resp,data){
            data.sortByProperty("dsName",true);
            for(var i=0;i<data.length;i++){
                var record={
                    oldName:data[i].dsName,
                    newName:data[i].dsName+data[i].suffix
                };
                _this.collisionMyItems[i].editRecord(record);
            }
        });
        isc.RPCManager.sendQueue();
    }
,isc.A.collisionSuffixChanged=function isc_DataSourceRenameDSWizard_collisionSuffixChanged(newSuffix){
        newSuffix=newSuffix||"";
        var form=this.collisionTheirItems[1],
            items=form.getItems(),
            record=form.getValues();
        for(var i=0;i<items.length;i++){
            record["name"+(i+1)]=record["baseName"+(i+1)]+"_"+newSuffix;
        }
        form.setValues(record);
        form.clearErrors();
    }
,isc.A.collisionCancelClicked=function isc_DataSourceRenameDSWizard_collisionCancelClicked(){
        this.close();
        this.markForDestroy();
    }
,isc.A.collisionOKClicked=function isc_DataSourceRenameDSWizard_collisionOKClicked(){
        if(this.collisionMyItemsLayout.isVisible()){
            this.renameMyItems();
        }else{
            this.renameTheirItems();
        }
    }
,isc.A.renameMyItems=function isc_DataSourceRenameDSWizard_renameMyItems(){
        var _this=this;
        for(var j=0;j<_this.collisionMyItems.length;j++){
            this.collisionMyItems[j].clearErrors(true);
        }
        this.validateMyItemsForm(function(data){
            if(data.length>0){
                var error=false;
                for(var i=0;i<data.length;i++){
                    for(var j=0;j<_this.collisionMyItems.length;j++){
                        if(_this.collisionMyItems[j].getValue("newName")==data[i]){
                            _this.collisionMyItems[j].setError("newName",
                                                        "DataSource name already in use");
                            _this.collisionMyItems[j].showErrors();
                            error=true;
                        }
                    }
                }
                if(error)return;
            }
            _this.close();
            var newDsNames=[],oldDsNames=[],renameMap={};
            for(var i=0;i<_this.collisionMyItems.length;i++){
                newDsNames.add(_this.collisionMyItems[i].getValue("newName"));
                oldDsNames.add(_this.collisionMyItems[i].getValue("oldName"));
                renameMap[_this.collisionMyItems[i].getValue("oldName")]=
                            _this.collisionMyItems[i].getValue("newName");
            }
            if(_this.renameCallback)return _this.renameCallback(newDsNames);
            isc.showPrompt("Renaming and importing DataSources... ${loadingImage}");
            var wasQueueing=isc.RPCManager.startQueue();
            var serverRenamed=_this.collisionMyItems.length;
            var vb=_this.builder;
            for(i=0;i<newDsNames.length;i++){
                vb.dsDataSource.performCustomOperation("renameDataSource",{
                    fromName:oldDsNames[i],
                    toName:newDsNames[i],
                    renameMap:renameMap
                },function(resp,data){
                    if(--serverRenamed<=0){
                        _this._loadRenamedDataSources(newDsNames,oldDsNames);
                    }
                });
            }
            if(!wasQueueing){
                isc.RPCManager.sendQueue();
            }
        });
    }
,isc.A.renameTheirItems=function isc_DataSourceRenameDSWizard_renameTheirItems(){
        var _this=this;
        if(!this.collisionTheirItems[0].validate()){
            return;
        }
        this.validateTheirItemsForm(function(data){
            if(data.length>0){
                var error=false;
                for(var i=0;i<data.length;i++){
                    var name0=_this.collisionTheirItems[0].getValue("baseName")+
                                    _this.collisionTheirItems[0].getValue("suffix");
                    if(name0==data[i]){
                        _this.collisionTheirItems[0].setError("suffix",
                                                    "DataSource name already in use");
                        _this.collisionTheirItems[0].showErrors();
                        error=true;
                        continue;
                    }
                    for(var j=1;j<=_this.collisionTheirItems[1].fields.length;j++){
                        if(_this.collisionTheirItems[1].getValue("name"+j)==data[i]){
                            _this.collisionTheirItems[1].setError("name"+j,
                                                        "DataSource name already in use");
                            _this.collisionTheirItems[1].showErrors();
                            error=true;
                        }
                    }
                }
                if(error)return;
            }
            _this.close();
            var newDsNames=[],oldDsNames=[],renameMap={};
            newDsNames.add(_this.collisionTheirItems[0].getValue("baseName")+
                                _this.collisionTheirItems[0].getValue("suffix"));
            oldDsNames.add(_this.collisionTheirItems[0].getValue("baseName").
                                substring(0,_this.collisionTheirItems[0].getValue("baseName").length-1));
            renameMap[oldDsNames[0]]=newDsNames[0];
            for(var i=1;i<=_this.collisionTheirItems[1].fields.length;i++){
                newDsNames.add(_this.collisionTheirItems[1].getValue("name"+i));
                oldDsNames.add(_this.collisionTheirItems[1].getValue("baseName"+i));
                renameMap[oldDsNames[i]]=newDsNames[i];
            }
            isc.showPrompt("Renaming and importing DataSources... ${loadingImage}");
            var wasQueueing=isc.RPCManager.startQueue();
            var serverRenamed=newDsNames.length;
            var vb=_this.builder;
            for(i=0;i<newDsNames.length;i++){
                vb.dsDataSource.performCustomOperation("importDataSourceWithRename",{
                    baseName:oldDsNames[i],
                    importAsName:newDsNames[i],
                    renameMap:renameMap
                },function(resp,data){
                    if(--serverRenamed<=0){
                        for(var i=0;i<newDsNames.length-1;i++){
                            vb.project.addDatasource(newDsNames[i],null,null,true);
                        }
                        vb.project.addDatasource(newDsNames[newDsNames.length-1],null,function(){
                            vb.loadProject(vb.project.fileName,null,function(){
                                isc.clearPrompt();
                                isc.Notify.addMessage(
                                    newDsNames.length+" DataSource(s) imported and renamed",
                                    [],
                                    "dsListNotifications",
                                    {
                                        duration:0,
                                        canDismiss:true,
                                        messageIcon:isc.Canvas._blankImgURL,
                                        disappearMethod:"instant",
                                        x:vb.dataSourceList.body.getPageLeft()-(350),
                                        y:vb.dataSourceList.body.getPageTop(),
                                        labelProperties:{
                                            width:200
                                        }
                                    }
                                );
                                _this.markForDestroy();
                            });
                        });
                    }
                });
            }
            if(!wasQueueing){
                isc.RPCManager.sendQueue();
            }
        });
    }
,isc.A._loadRenamedDataSources=function isc_DataSourceRenameDSWizard__loadRenamedDataSources(newDsNames,oldDsNames){
        var _this=this,
            _builder=this.builder,
            samples=this.builder.getSampleDataSourceNames();
        isc.DataSource.load(newDsNames,function(){
            var localAdded=0;
            var dsMap={};
            for(var i=0;i<oldDsNames.length;i++){
                dsMap[oldDsNames[i]]=newDsNames[i];
            }
            _builder.project.renameDataSourceOnScreens(dsMap,null,true,function(){
                var addDataSources=function(){
                    _builder.project.addDatasource(newDsNames[localAdded],null,function(){
                        if(++localAdded<newDsNames.length){
                            addDataSources();
                            return;
                        }
                        _builder.addDataSourcesToProject(true,true,function(){
                            _builder.project.autoSave(function(){
                                _builder.loadProject(_builder.project.fileName,null,function(){
                                    isc.clearPrompt();
                                    isc.Notify.addMessage(
                                        newDsNames.length+" DataSource(s) renamed and "+
                                        samples.length+" sample DataSource(s) imported",
                                        [],
                                        "dsListNotifications",
                                        {
                                            duration:0,
                                            canDismiss:true,
                                            messageIcon:isc.Canvas._blankImgURL,
                                            disappearMethod:"instant",
                                            x:_builder.dataSourceList.body.getPageLeft()-(350),
                                            y:_builder.dataSourceList.body.getPageTop(),
                                            labelProperties:{
                                                width:200
                                            }
                                        }
                                    );
                                    _this.markForDestroy();
                                });
                            });
                        });
                    });
                };
                addDataSources();
            },true,true);
        },true,true);
    }
,isc.A.validateMyItemsForm=function isc_DataSourceRenameDSWizard_validateMyItemsForm(callback){
        var nameSet=[];
        for(var i=0;i<this.collisionMyItems.length;i++){
            nameSet.add(this.collisionMyItems[i].getValue("newName"));
        }
        this.builder.dsDataSource.performCustomOperation("findNonUniqueNames",{nameSet:nameSet},function(resp,data){
            callback(data||[]);
        });
    }
,isc.A.validateTheirItemsForm=function isc_DataSourceRenameDSWizard_validateTheirItemsForm(callback){
        var nameSet=[];
        nameSet.add(this.collisionTheirItems[0].getValue("baseName")+this.collisionTheirItems[0].getValue("suffix"));
        var index=this.collisionTheirItems[1].getValues();
        for(var fieldName in index){
            if(fieldName.startsWith("name")){
                nameSet.add(index[fieldName]);
            }
        }
        this.builder.dsDataSource.performCustomOperation("findNonUniqueNames",{nameSet:nameSet},function(resp,data){
            callback(data||[]);
        });
    }
);
isc.B._maxIndex=isc.C+11;

isc.defineClass("DataImportDialog","Dialog");
isc.A=isc.DataImportDialog.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.isModal=true;
isc.A.title="Import Data";
isc.A.width=700;
isc.A.height=490;
isc.A.padding=0;
isc.A.uploaderDefaults={
        showFilePickerForm:true,
        width:"100%",
        gridProperties:{
            defaultHeight:340
        },
        uploadReply:function(data){
            this.Super("uploadReply",arguments);
            var saveTestDataCheckboxField={
                type:"checkbox",
                name:"save_cb",
                title:"Save as test data (so you can re-import any time)."
            };
            if(!this.checkForData){
                saveTestDataCheckboxField.value=true;
            }else{
                saveTestDataCheckboxField.title+=
                    "<font color='red'>WARNING: will overwrite existing test data file and should not be checked.</font>";
            }
            var wipeDataCheckboxField={
                type:"checkbox",
                name:"wipe_cb",
                title:"Wipe existing data before import"
            };
            this.checkForDataForm=isc.DynamicForm.create({
                titleWidth:0,
                fields:[saveTestDataCheckboxField,wipeDataCheckboxField]
            });
            var dialog=this.creator.body;
            var oldReflowMethod=dialog.reflowNow;
            dialog.reflowNow=function(){
                this.Super("reflowNow",arguments);
                dialog.scrollToBottom();
                dialog.reflowNow=oldReflowMethod;
            }
            this.addMember(this.checkForDataForm,this.getMembers().indexOf(this.grid)+1);
        },
        commit:function(){
            if(this.checkForDataForm.getValue("save_cb")){
                this.storeTestData();
            }
            if(this.checkForDataForm.getValue("wipe_cb")){
                var _this=this;
                isc.confirm("Really remove all existing records from this DataSource? This operation cannot be undone.",
                    function(value){
                        if(value){
                            var ds=isc.DataSource.getDataSource(_this.grid.dataSource);
                            var batchUploadDs=isc.DataSource.getDataSource(_this.batchUploadDSName);
                            batchUploadDs.performCustomOperation("wipeData",{dsName:ds.ID},function(){
                                ds.updateCaches({invalidateCache:true});
                                _this.Super("commit",arguments);
                            },{});
                        }else{
                            _this.Super("commit",arguments);
                        }
                    });
            }else{
                this.Super("commit",arguments);
            }
        },
        setCheckForData:function(data){
            this.checkForData=data;
            if(this.checkForDataForm&&data){
                var saveTestDataCheckboxField=this.checkForDataForm.getField("save_cb");
                saveTestDataCheckboxField.title+=
                    "<font color='red'>WARNING: will overwrite existing test data file and should not be checked.</font>";
                saveTestDataCheckboxField.setValue(false);
            }
        },
        cleanup:function(){
            this.Super("cleanup",arguments);
            this.checkForDataForm.destroy();
            this.checkForDataForm=null;
            this.creator.close();
        }
    };
isc.A.uploaderConstructor="BatchUploader";
isc.A.helpMessageDefaults={
        contents:"Supported data formats are: "+
            "<ul>"+
                "<li> CSV or TSV (comma- or tab-separated values)"+
                "<li> JSON - an Array of Objects"+
                "<li> XML"+
            "</ul>"+
            "All data formats are described in more detail in the documentation under \"Test Data\" "+
            "<a href=\"http://www.smartclient.com/docs/release/a/b/c/go.html#group..testData\" target=\"_blank\">(click for docs at SmartClient.com)</a>"+
            "<p>Either DataSource field names or field titles may be used."
    };
isc.A.helpMessageConstructor="HTMLFlow";
isc.B.push(isc.A.initWidget=function isc_DataImportDialog_initWidget(){
        this.Super("initWidget",arguments);
        var dialog=this;
        this.helpMessage=this.createAutoChild("helpMessage");
        this.uploader=this.createAutoChild("uploader",{
            uploadDataSource:this.targetDataSource,
            dataFormat:"auto"
        });
        this.addItem(this.helpMessage);
        this.addItem(this.uploader);
        var dsName=this.targetDataSource.ID||this.targetDataSource;
        this.title="Import Data to "+dsName;
        var dataImportDialog=this;
        isc.DMI.callBuiltin({
            appID:"isc_builtin",
            className:"com.isomorphic.tools.BuiltinRPC",
            methodName:"checkForTestData",
            arguments:[{dsName:dsName}],
            callback:function(dsResponse,data,dsRequest){
                dataImportDialog.uploader.setCheckForData(data);
            }
        });
    }
);
isc.B._maxIndex=isc.C+1;

isc.defineClass("SchemaViewer","VLayout");
isc.A=isc.SchemaViewer;
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.B.push(isc.A.getTreeFromService=function isc_c_SchemaViewer_getTreeFromService(service){
    return isc.Tree.create({
        service:service,
        nameProperty:"_nodeName",
        titleProperty:"name",
        loadChildren:function(parent){
            if(this.isLoaded(parent))return;
            if(parent==this.root&&isc.isA.WebService(this.service)){
                var operations=this.service.getOperations();
                operations.setProperty("type","Operation");
                this.addList(operations,parent);
            }else if(parent==this.root&&isc.isA.SchemaSet(this.service)){
                var schemaSet=this.service;
                for(var i=0;i<schemaSet.schema.length;i++){
                    this.add(this.getSchemaNode(schemaSet.schema[i]),
                             this.root);
                }
            }else if(parent.inputMessage){
                var message=this.getMessageNode(parent,true);
                if(message!=null)this.add(message,parent);
                message=this.getMessageNode(parent,false);
                if(message!=null)this.add(message,parent);
            }else if(parent.isComplexType){
                var parentDS=parent.liveSchema;
                for(var fieldName in parentDS.getFields()){
                    var field=parentDS.getField(fieldName);
                    if(!parentDS.fieldIsComplexType(fieldName)){
                        this.add(isc.addProperties({},field),parent);
                    }else{
                        var childDS=parentDS.getSchema(field.type);
                        var node=this.getSchemaNode(childDS,field.name,field.xmlMaxOccurs);
                        this.add(node,parent);
                    }
                }
            }
            this.setLoadState(parent,isc.Tree.LOADED);
        },
        isFolder:function(node){
            return(node==this.root||node.inputMessage||node.isComplexType);
        },
        getSchemaNode:function(childDS,fieldName,maxOccurs){
            var schemaSet=isc.SchemaSet.get(childDS.schemaNamespace),
                field=childDS.getField(fieldName),
                node={
                name:fieldName||childDS.tagName||childDS.ID,
                type:childDS.ID,
                isComplexType:true,
                xmlMaxOccurs:maxOccurs,
                liveSchema:childDS,
                namespace:childDS.schemaNamespace,
                location:schemaSet?schemaSet.location:null
            };
            return node;
        },
        getMessageNode:function(operation,isInput){
            var messageDS=isInput?this.service.getRequestMessage(operation):
                                      this.service.getResponseMessage(operation);
            if(!messageDS)return;
            return{
                name:messageDS.ID,
                type:messageDS.ID,
                isComplexType:true,
                liveSchema:messageDS
            };
        }
    });
}
);
isc.B._maxIndex=isc.C+1;

isc.A=isc.SchemaViewer.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.showTestUI=true;
isc.A.operationIcon="[SKINIMG]/SchemaViewer/operation.png";
isc.A.complexTypeIcon="[SKINIMG]/SchemaViewer/complexType.gif";
isc.A.simpleTypeIcon="[SKINIMG]/SchemaViewer/simpleType.png";
isc.B.push(isc.A.setWsdlURL=function isc_SchemaViewer_setWsdlURL(url){
    this.wsdlURL=url;
    this.urlForm.setValue("url",url);
}
,isc.A.getWsdlURLs=function isc_SchemaViewer_getWsdlURLs(){
    var loadedServiceURNs=isc.WebService.services.getProperty("serviceNamespace"),
        defaultWSDLs=this.wsdlURLs;
    if(defaultWSDLs==null&&loadedServiceURNs.length==0)return;
    if(defaultWSDLs==null)defaultWSDLs=[];
    defaultWSDLs.addList(loadedServiceURNs);
    return defaultWSDLs;
}
,isc.A.initWidget=function isc_SchemaViewer_initWidget(){
    this.Super("initWidget",arguments);
    this.createChildren();
}
,isc.A.createChildren=function isc_SchemaViewer_createChildren(){
    var wsdlURLs=this.getWsdlURLs();
    this.addAutoChild("urlForm",{
        numCols:4,
        colWidths:[100,"*",100,100],
        itemHoverWidth:300,
        saveOnEnter:true,
        saveData:function(){
            this.creator.fetchSchema();
        },
        items:[
            {name:"url",title:"WSDL",width:"*",defaultValue:this.wsdlURL,
                editorType:(wsdlURLs!=null?"ComboBoxItem":"TextItem"),
                autoComplete:(wsdlURLs!=null?"smart":null),
                showAllOptions:true,textMatchStyle:"substring",
                valueMap:wsdlURLs
            },
            {type:"submit",title:"Show Messages",
              startRow:false,colSpan:1,endRow:false,width:"*"
            },
            {showTitle:false,startRow:false,width:"*",
              formItemType:"pickTree",
              shouldSaveValue:false,
              buttonProperties:{
                unselectedTitle:"Download",
                itemSelected:function(item){
                    this.canvasItem.form.creator.download(item.name);
                    return false;
                }
              },
              valueTree:isc.Tree.create({
                  root:{name:"download",title:"Download",children:[
                          {name:"js",title:"as JS"},
                          {name:"xml",title:"as XML"}
                        ]}
              }),
              icons:[
                {src:"[SKIN]/actions/help.png",width:16,height:16,
                  prompt:"You can use the <b>Download</b> feature to download a SmartClient"
                         +" WebService definition for the specified WSDL file in either XML"
                         +" or JS format.  <p>You can achieve the same result by calling"
                         +" <i>XMLTools.loadWSDL()</i> or by using the <code>&lt;isomorphic"
                         +":loadWSDL&gt;</code> JSP tag, however, for non-Java backends or"
                         +" for production use, a .js file should be obtained from this"
                         +" interface and loaded via &lt;SCRIPT SRC=&gt; either individually"
                         +" or combined with other files.  <p>See the reference documentation"
                         +" for details.",
                  click:"isc.say(this.prompt)"
                }
              ]
            }
        ]
    },isc.DynamicForm);
    this.addMember(isc.VLayout.create({
        autoDraw:false,
        members:[
            isc.HLayout.create({
                autoDraw:false,
                members:[
                    this.addAutoChild("treeGrid",{
                        fields:[
                            {treeField:true},
                            {name:"type",title:"Type",width:140},
                            {name:"xmlMaxOccurs",title:"#",width:35},
                            {name:"namespace",title:"NS",width:35,showHover:true,
                             hoverHTML:function(record,value){return"<NOBR>"+value+"<NOBR>"}},
                            {name:"location",title:"URL",width:35,showHover:true,
                             hoverHTML:function(record,value){return"<NOBR>"+value+"<NOBR>"},
                             recordClick:function(viewer,record){
                                 viewer.creator.setWsdlURL(record.location);
                                 viewer.creator.fetchSchema();
                             }
                            }
                        ],
                        nodeClick:function(grid,node,rowNum){
                            if(this.creator.showTestUI){
                                this.creator.updateInputStack(node);
                            }
                        },
                        getIcon:function(node){
                            if(node.type=="Operation")return this.creator.operationIcon;
                            else if(node.isComplexType)return this.creator.complexTypeIcon;
                            else return this.creator.simpleTypeIcon;
                        },
                        showResizeBar:true
                    },isc.TreeGrid),
                    isc.VLayout.create({
                        visibility:(this.showTestUI?"inherit":"hidden"),
                        members:[
                            this.addAutoChild("inputStack",{
                                overflow:"auto",
                                visibilityMode:"multiple",
                                autoDraw:false,
                                sections:[
                                    {showHeader:true,title:"Input Message (Body)",
                                     items:[
                                        this.addAutoChild(
                                            "inputBodyForm",
                                            {useFlatFields:true},
                                            isc.DynamicForm)
                                     ]
                                    }
                                ]
                            },isc.SectionStack),
                            isc.IButton.create({
                                creator:this,
                                autoDraw:false,
                                title:"Invoke",
                                click:function(){
                                    this.creator.updateResponseTree();
                                }
                            })
                        ]
                    })
                ]
            }),
            this.addAutoChild("responseStack",{
                visibility:(this.showTestUI?"inherit":"hidden"),
                autoDraw:false,
                visibilityMode:"multiple",
                sections:[
                    this.getResponseSectionConfig()
                ]
            },
            isc.SectionStack)
        ]
    })
    );
}
,isc.A.download=function isc_SchemaViewer_download(format){
    var url=this.urlForm.getValue("url");
    if(!url){
        isc.warn("Please type in a WSDL URL");
        return;
    }
    var fileName=url.replace(/(.*\/)?(.*)/,"$2")
                      .replace(/(.*?)\?.*/,"$1")
                      .replace(/(.*)\..*/,"$1")
                   +"."+format;
    isc.DMI.callBuiltin({
        methodName:"downloadWSDL",
        arguments:[url,format,fileName],
        requestParams:{
            showPrompt:false,
            useXmlHttpRequest:false,
            timeout:0
        }
    });
}
,isc.A.fetchSchema=function isc_SchemaViewer_fetchSchema(){
    var url=this.urlForm.getValue("url");
    if(url==null||url=="")return;
    if(isc.WebService.get(url))return this.fetchSchemaReply(isc.WebService.get(url));
    isc.RPCManager.addClassProperties({
        defaultPrompt:"Loading WSDL Schema",
        showPrompt:true
    })
    isc.xml.loadWSDL(url,{target:this,methodName:"fetchSchemaReply"},null,true,
                     {captureXML:true});
}
,isc.A.fetchSchemaReply=function isc_SchemaViewer_fetchSchemaReply(service){
    isc.RPCManager.addClassProperties({
        defaultPrompt:"Contacting Server..."
    });
    this.service=service;
    delete this.operationName;
    var theTree=isc.SchemaViewer.getTreeFromService(service);
    this.treeGrid.setData(theTree);
    this.clearInputStack();
    this.clearResponseTree();
}
,isc.A.clearInputStack=function isc_SchemaViewer_clearInputStack(){
    var stack=this.inputStack,
        sectionsArr=stack.sections.duplicate(),
        headerSections=[];
    for(var i=0;i<sectionsArr.length;i++){
        if(sectionsArr[i].isHeaderSection)stack.removeSection(sectionsArr[i]);
    }
    this.inputBodyForm.hide();
    this.inputBodyForm.clearValues();
}
,isc.A.updateInputStack=function isc_SchemaViewer_updateInputStack(node){
    this.clearInputStack();
    var operationNode=node;
    while(operationNode.type!="Operation"){
        operationNode=this.treeGrid.data.getParent(operationNode);
    }
    if(!operationNode)return;
    var operationName=operationNode.name;
    this.operationName=operationName;
    var inputHeaderSchema=this.service.getInputHeaderSchema(operationName);
    if(inputHeaderSchema!=null){
        var index=0;
        for(var schemaName in inputHeaderSchema){
            var schema=inputHeaderSchema[schemaName],
                editForm;
            if(isc.isA.DataSource(schema)){
                editForm=isc.DynamicForm.create({
                    useFlatFields:true,
                    dataSource:schema
                })
            }else{
                editForm=isc.DynamicForm.create({
                    _singleField:true,
                    fields:[schema]
                })
            }
            this.inputStack.addSection({showHeader:true,isHeaderSection:true,
                              schemaName:schemaName,
                              title:"Header: "+schemaName,
                              items:[editForm]
            },index);
            index+=1;
        }
    }
    var inputDS=this.service.getInputDS(operationName);
    this.inputBodyForm.setDataSource(inputDS);
    if(!this.inputBodyForm.isVisible())this.inputBodyForm.show();
}
,isc.A.updateResponseTree=function isc_SchemaViewer_updateResponseTree(){
    if(this.operationName==null)return;
    var params=this.inputBodyForm.getValues(),
        headerParams,
        service=this.service;
    for(var i=0;i<this.inputStack.sections.length;i++){
        var section=this.inputStack.sections[i];
        if(!section.isHeaderSection)continue;
        if(headerParams==null)headerParams={};
        var editForm=section.items[0];
        if(editForm._singleField){
            headerParams[section.schemaName]=editForm.getValue(editForm.getItem(0));
        }else{
            headerParams[section.schemaName]=editForm.getValues();
        }
    }
    if(this.logIsDebugEnabled())
        this.logDebug("operation:"+this.operationName+
        ", body params:"+this.echoAll(params)+", headerParams:"+this.echoAll(headerParams));
    service.callOperation(this.operationName,
                            params,null,
                            this.getID()+".setResponseTreeDoc(xmlDoc, rpcResponse, wsRequest)",
                            {willHandleError:true,
                             headerData:headerParams,
                             useFlatFields:true,useFlatHeaderFields:true}
                            );
}
,isc.A.getResponseSectionConfig=function isc_SchemaViewer_getResponseSectionConfig(){
    return{expanded:true,title:"Service Response",
             headerControls:[
                 isc.LayoutSpacer.create(),
                 isc.IButton.create({
                    width:200,
                    title:"Generate Sample Response",
                    creator:this,
                    click:function(){
                        if(!this.creator.operationName)return;
                        var data=this.creator.service.getSampleResponse(this.creator.operationName);
                        data=isc.XMLTools.parseXML(data);
                        this.creator.setResponseTreeDoc(data);
                        this.creator.responseStack.setSectionTitle(0,"Service Response [Generated Sample]");
                        return false;
                    },
                    height:16,layoutAlign:"center",extraSpace:4,autoDraw:false
                 }),
                 isc.IButton.create({
                    width:200,
                    title:"Generate Sample Request",
                    creator:this,
                    click:function(){
                        if(!this.creator.operationName)return;
                        var data=this.creator.service.getSampleRequest(this.creator.operationName);
                        data=isc.XMLTools.parseXML(data);
                        this.creator.showSampleRequest(data);
                        return false;
                    },
                    height:16,layoutAlign:"center",extraSpace:4,autoDraw:false
                 })
             ],
             items:[
             ]
            }
}
,isc.A.setResponseTreeDoc=function isc_SchemaViewer_setResponseTreeDoc(xmlDoc,rpcResponse,wsRequest){
    if(rpcResponse&&rpcResponse.status<0){
        var faultStrings;
        if(rpcResponse.httpResponseCode==500){
            faultStrings=xmlDoc.selectNodes("//faultstring");
            if(faultStrings!=null)faultStrings=isc.XML.toJS(faultStrings);
            if(faultStrings.length==0)faultStrings=null;
        }
        if(faultStrings){
            isc.warn("<b>Server Returned HTTP Code 500 (Internal Error)</b>"
                    +(faultStrings&&faultStrings.length>0?
                        ("<br><br>"+faultStrings.join("<br>")):""));
        }else{
            isc.RPCManager.handleError(rpcResponse,wsRequest);
        }
        return;
    }
    this.logInfo("showing a tree response");
    if(this.logIsDebugEnabled())this.logDebug("response data:"+this.echoAll(xmlDoc));
    this.clearSampleRequest();
    this.xmlDoc=xmlDoc;
    var domTree=isc.DOMTree.create({rootElement:xmlDoc.documentElement});
    if(this.responseTree){
        this.responseTree.setData(domTree);
    }else{
        this.addAutoChild("responseTree",{data:domTree},isc.DOMGrid)
    }
    if(!this.showingResponseTree){
        this.responseStack.removeSection(0);
        this.responseStack.addSection(
            isc.addProperties(
                this.getResponseSectionConfig(),
                {items:[this.responseTree]}
            ),
            0
        );
    }
    this.showingResponseTree=true;
}
,isc.A.clearResponseTree=function isc_SchemaViewer_clearResponseTree(){
    this.clearSampleRequest();
    if(!this.showingResponseTree)return;
    this.responseStack.removeSection(0);
    this.responseStack.addSection(this.getResponseSectionConfig())
    delete this.showingResponseTree;
}
,isc.A.showSampleRequest=function isc_SchemaViewer_showSampleRequest(data){
    this.logInfo("showing a sample request");
    if(this.logIsDebugEnabled())this.logDebug("sample request data:"+this.echoAll(data));
    var domTree=isc.DOMTree.create({rootElement:data.documentElement});
    if(!this.showingSampleRequest){
        this.responseStack.addSection({
            isSampleRequest:true,
            expanded:true,resizable:true,
            title:"Generated Sample Service Request",
            items:[
                this.addAutoChild("requestTree",{data:domTree},isc.DOMGrid)
            ]
        });
    }else{
        this.requestTree.setData(domTree);
    }
    this.showingSampleRequest=true
}
,isc.A.clearSampleRequest=function isc_SchemaViewer_clearSampleRequest(){
    if(this.showingSampleRequest){
        for(var i=0;i<this.responseStack.sections.length;i++){
            if(this.responseStack.sections[i].isSampleRequest){
                this.responseStack.removeSection(i);
                break;
            }
        }
    }delete this.showingSampleRequest;
}
);
isc.B._maxIndex=isc.C+15;

isc.ClassFactory.defineClass("DatabaseBrowser","Window");
isc.A=isc.DatabaseBrowser.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.orientation="vertical";
isc.A.title="Database Browser";
isc.A.width="90%";
isc.A.height="90%";
isc.A.isModal=true;
isc.A.showModalMask=true;
isc.A.canDragResize=true;
isc.A.shouldAutoFetchData=true;
isc.A.serverType="sql";
isc.A.schemaTreeConstructor="ListGrid";
isc.A.schemaTreeDefaults={
        autoParent:"schemaView",
        dbBrowser:this.creator,
        dataSource:isc.DataSource.create({
            addGlobalId:false,
            ID:"isc_dbBrowserSchemaTreeDS",
            clientOnly:true,
            _internal:true,
            fields:[
                {name:"name",title:"Name",primaryKey:true},
                {name:"type",title:"Type",width:60,valueMap:["table","view"]}
            ]
        }),
        showFilterEditor:true,
        filterOnKeypress:true,
        canExpandRecords:true,
        detailDefaults:{
            _constructor:"ListGrid",
            autoFitData:"vertical",
            autoFitMaxRecords:8,
            showResizeBar:true
        },
        getExpansionComponent:function(record){
            var component=this.createAutoChild("detail",{
                sortField:"primaryKey",
                sortDirection:"descending",
                defaultFields:[
                    {name:"name",title:"Column",formatCellValue:function(value,record){
                        if(record.primaryKey)return"<b>"+value+"</b>";
                        return value;
                    }},
                    {name:"type",title:"Type",width:50},
                    {name:"length",title:"Length",width:45},
                    {name:"primaryKey",title:"PK",type:"boolean",showIf:"false",width:22}
                ]
            });
            isc.DMI.call("isc_builtin","com.isomorphic.tools.BuiltinRPC","getFieldsFromTable",
                record.name,this.schema,this.serverType,this.creator.dbName,
                function(rpcResponse,data){
                component.setData(data);
            });
            return component;
        },
        selectionChanged:function(record,state){
            if(state){
                var objectName=record.name;
                if(objectName&&objectName!=this.creator._selectedTable){
                    this.creator.getDataSourceFromTable(objectName);
                    this.creator.populateDataViewHeader();
                }
            }
        }
    };
isc.A.schemaRefreshButtonDefaults={
        _constructor:"Img",
        size:16,
        src:"[SKIN]/actions/refresh.png",
        click:"this.creator.getDatabaseTables()"
    };
isc.A.databaseListConstructor="ListGrid";
isc.A.databaseListDefaults={
        height:150,
        autoParent:"schemaView",
        dataSource:isc.DataSource.create({
            addGlobalId:false,
            ID:"isc_dbBrowserDBListDS",
            clientOnly:true,
            _internal:true,
            fields:[
                {name:"dbName",title:"Name",primaryKey:true},
                {name:"dbStatus",title:"Status"},
                {name:"dbProductName",title:"Product Name"},
                {name:"dbProductVersion",title:"Product Version"}
            ]
        }),
        defaultFields:[
            {name:"dbName"},
            {name:"dbStatus"}
        ],
        sortField:"dbName",
        showFilterEditor:true,
        filterOnKeypress:true,
        canDragSelectText:true,
        selectionChanged:function(record,state){
            if(state){
                this.creator.clearSchemaTree();
                this.creator.dbName=record.dbName;
                this.creator.getDatabaseTables();
            }
        },
        canHover:true,
        cellHoverHTML:function(record){
            if(!this.hoverDV)this.hoverDV=isc.DetailViewer.create({dataSource:this.dataSource,width:200,autoDraw:false});
            this.hoverDV.setData(record);
            return this.hoverDV.getInnerHTML();
        }
    };
isc.A.dbListConfigButtonDefaults={
        _constructor:"Img",
        size:16,
        src:"database_gear.png",
        click:"this.creator.configureDatabases()",
        prompt:"Configure database connections"
    };
isc.A.dbListRefreshButtonDefaults={
        _constructor:"Img",
        size:16,
        src:"[SKIN]/actions/refresh.png",
        click:"this.creator.getDefinedDatabases()"
    };
isc.A.dataGridConstructor="ListGrid";
isc.A.dataGridDefaults={
        canDragSelectText:true,
        autoFitFieldWidths:true,
        autoFitWidthApproach:"title",
        autoParent:"dataView",
        skipNullDataSourceCheck:true,
        dataArrived:function(){
            if(this.showFilterEditor!=false){
                this.setShowFilterEditor(true);
            }
        }
    };
isc.A.navToolbarConstructor="HLayout";
isc.A.navToolbarDefaults={
        height:22,
        layoutMargin:10,
        membersMargin:10,
        autoParent:"outerLayout"
    };
isc.A.showCancelButton=true;
isc.A.cancelButtonConstructor="Button";
isc.A.cancelButtonDefaults={
        title:"Cancel",
        autoParent:"navToolbar"
    };
isc.A.showSelectButton=true;
isc.A.selectButtonConstructor="Button";
isc.A.selectButtonDefaults={
        title:"Next >",
        disabled:true,
        autoParent:"navToolbar"
    };
isc.A.outerLayoutDefaults={
         _constructor:isc.VLayout,
         width:"100%",height:"100%",
         autoSize:true,autoDraw:true,
         autoParent:"body"
    };
isc.A.innerLayoutDefaults={
         _constructor:isc.HLayout,
         width:"100%",height:"100%",
         autoDraw:true,
         autoParent:"outerLayout"
    };
isc.A.showSchemaView=true;
isc.A.schemaViewDefaults={
         _constructor:isc.SectionStack,
         visibilityMode:"multiple",
         autoParent:"innerLayout"
    };
isc.A.showDataView=true;
isc.A.dataViewDefaults={
         _constructor:isc.SectionStack,
         width:"65%",height:"100%",
         autoParent:"innerLayout"
    }
;
isc.B.push(isc.A.configureDatabases=function isc_DatabaseBrowser_configureDatabases(){
        var _this=this;
        var dbConsole=isc.DBConfigurator.showWindow({
            width:this.getVisibleWidth()-50,
            height:this.getVisibleHeight()-50,
            autoCenter:true,
            isModal:true,
            closeClick:function(){
                this.destroy();
                _this.getDefinedDatabases();
            }
        });
    }
);
isc.B._maxIndex=isc.C+1;

isc.A=isc.DatabaseBrowser.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.B.push(isc.A.initWidget=function isc_DatabaseBrowser_initWidget(){
    this.Super("initWidget",arguments);
    this.title="Database Browser - "+this.serverType.toUpperCase();
    this.createChildren();
}
,isc.A.createChildren=function isc_DatabaseBrowser_createChildren(){
    this.Super("createChildren");
    this.body.hPolicy="fill";
    this.body.vPolicy="fill";
    this.addAutoChild("outerLayout");
    this.addAutoChild("innerLayout",null,null,this.outerLayout);
    this.addAutoChild("schemaView",{showResizeBar:this.showDataView},null,this.innerLayout);
    this.databaseList=this.createAutoChild("databaseList");
    this.dbListConfigButton=this.createAutoChild("dbListConfigButton");
    this.dbListRefreshButton=this.createAutoChild("dbListRefreshButton");
    if(this.serverType=="sql"){
        this.schemaView.addSection({
            title:"Databases",showHeader:true,expanded:true,hidden:false,
            items:[this.databaseList],
            controls:[this.dbListConfigButton,this.dbListRefreshButton]
        });
    }
    this.addAutoChild("dataView",null,null,this.innerLayout);
    this.dataView.addSection({autoDraw:true,showHeader:true,expanded:true,hidden:false,
        title:"No table selected"
    });
    this.dataStack=this.dataView.sections[0];
    this.schemaTree=this.createAutoChild("schemaTree");
    this.schemaRefreshButton=this.createAutoChild("schemaRefreshButton");
    this.schemaView.addSection({
        title:"Tables & Views",
        showHeader:true,expanded:true,hidden:false,
        items:[this.schemaTree],
        controls:[this.schemaRefreshButton]
    });
    var dbBrowser=this;
    this.dataGrid=this.createAutoChild("dataGrid");
    this.dataStack.addItem(this.dataGrid);
    this.addAutoChild("navToolbar",null,this.outerLayout);
    this.navToolbar.addMember(isc.LayoutSpacer.create());
    this.addAutoChild("cancelButton",{
        click:function(){
            dbBrowser.hide();
            dbBrowser.markForDestroy();
        }
    });
    this.addAutoChild("selectButton",{
        click:function(){
            dbBrowser.hide();
            dbBrowser._paletteNode.defaults=dbBrowser.getGeneratedDataSourceObject();
            dbBrowser.fireCallback(dbBrowser._getResultsCallback,"node",
                [dbBrowser._paletteNode])
        }
    });
    if(this.shouldAutoFetchData){
        this.delayCall("getDefinedDatabases");
    }
}
,isc.A.getDefinedDatabases=function isc_DatabaseBrowser_getDefinedDatabases(){
    if(this.serverType=="hibernate"){
        this.databaseList.hide();
        this.dbName=null;
        this.getDatabaseTables();
    }else{
        isc.DMI.call({
            appID:"isc_builtin",
            className:"com.isomorphic.tools.AdminConsole",
            methodName:"getDefinedDatabases",
            arguments:[true],
            callback:this.getID()+".populateDatabaseList(data)",
            requestParams:{
                showPrompt:true,
                promptStyle:"dialog",
                prompt:"Loading available databases..."
            }
        });
    }
}
,isc.A.getDatabaseTables=function isc_DatabaseBrowser_getDatabaseTables(){
    var dbBrowser=this;
    var includeList=this.includeSubstring;
    if(includeList&&!isc.isAn.Array(includeList))includeList=[includeList];
    var excludeList=this.excludeSubstring;
    if(excludeList&&!isc.isAn.Array(excludeList))excludeList=[excludeList];
    isc.DMI.call({
        appID:"isc_builtin",
        className:"com.isomorphic.tools.BuiltinRPC",
        methodName:"getTables",
        arguments:[this.serverType,this.dbName,true,true,this.catalog,this.schema,
                    includeList,excludeList],
        callback:function(data){
            dbBrowser.populateSchemaTree(data.data);
        },
        requestParams:{
            showPrompt:true,
            promptStyle:"dialog",
            prompt:"Loading schema..."
        }
    });
}
,isc.A.populateDatabaseList=function isc_DatabaseBrowser_populateDatabaseList(data){
    if(this.dbCriteria){
        data=isc.DataSource.applyFilter(data,this.dbCriteria);
    }
    this.databaseList.dataSource.setCacheData(data);
    var crit={dbStatus:"OK"};
    this.databaseList.invalidateCache();
    this.databaseList.setFilterEditorCriteria(crit);
    this.databaseList.filterData(crit);
}
,isc.A.clearSchemaTree=function isc_DatabaseBrowser_clearSchemaTree(data){
    this.schemaTree.setData([]);
    this._selectedTable=null;
    this.populateDataViewHeader();
}
,isc.A.populateSchemaTree=function isc_DatabaseBrowser_populateSchemaTree(data){
    for(var i=0;i<data.length;i++){
        data[i].name=data[i].TABLE_NAME;
        data[i].type=data[i].TABLE_TYPE.toLowerCase();
        data[i].isFolder=true;
        data[i].customIcon="[SKIN]../DatabaseBrowser/data.png";
    }
    this.schemaTree.dataSource.setCacheData(data);
    this.schemaTree.invalidateCache();
    this.schemaTree.filterData();
    if(this.schemaTreeTitle){
        this.populateSchemaTreeHeader();
    }
    this.tablesRetrieved=true;
}
,isc.A.populateSchemaTreeHeader=function isc_DatabaseBrowser_populateSchemaTreeHeader(){
}
,isc.A.populateDataViewHeader=function isc_DatabaseBrowser_populateDataViewHeader(){
    if(this._selectedTable){
        this.dataGridTitle="Data from table "+this._selectedTable;
        this.dataGrid.setShowHeader(true);
    }else{
        this.dataGridTitle="No table selected";
        this.dataGrid.setDataSource(null);
        this.dataGrid.setFields([{name:"placeholder",title:" "}]);
    }
    this.dataStack.setTitle(this.dataGridTitle);
}
,isc.A.getDataSourceFromTable=function(tableName){

    var dbBrowser=this;
    var shouldQuoteTableName=!/^[A-Za-z][0-9A-Za-z_]*$/.test(tableName);
    dbBrowser._selectedTable=tableName;
    if(dbBrowser.selectButton)dbBrowser.selectButton.setDisabled(false);
    isc.DMI.call("isc_builtin","com.isomorphic.tools.BuiltinRPC","getDataSourceJSONFromTable",
        tableName,this.serverType,this.dbName,tableName+"_dbBrowser",
        {quoteTableName:shouldQuoteTableName},
        function(rpcResponse,data){
            var temp="dbBrowser.generatedDataSourceObject = "+data;
            eval(temp);
            var gdsoFields=dbBrowser.generatedDataSourceObject.fields,
                originalFieldsCopy=[];
            for(var i=0;i<gdsoFields.length;i++){
                originalFieldsCopy[i]=isc.addProperties({},gdsoFields[i]);
            }
            isc.addProperties(dbBrowser.generatedDataSourceObject,{
                tableName:tableName,
                quoteTableName:shouldQuoteTableName,
                dbName:dbBrowser.dbName
            });
            dbBrowser.generatedDataSource=isc.DataSource.create(dbBrowser.generatedDataSourceObject);
            dbBrowser.generatedDataSourceObject.fields=originalFieldsCopy;
            if(dbBrowser.showDataView){
                dbBrowser.dataGrid.setDataSource(dbBrowser.generatedDataSource);
                dbBrowser.dataGrid.fetchData();
            }
        });
}
,isc.A.getGeneratedDataSource=function isc_DatabaseBrowser_getGeneratedDataSource(){
    return this.generatedDataSource;
}
,isc.A.getGeneratedDataSourceObject=function isc_DatabaseBrowser_getGeneratedDataSourceObject(){
    return this.generatedDataSourceObject;
}
,isc.A.getResults=function isc_DatabaseBrowser_getResults(newNode,callback,palette){
    this._getResultsCallback=callback;
    this._paletteNode=newNode;
}
);
isc.B._maxIndex=isc.C+13;

isc.ClassFactory.defineClass("HibernateBrowser","Window");
isc.A=isc.HibernateBrowser.getPrototype();
isc.A.orientation="vertical";
isc.A.width="90%";
isc.A.height="90%";
isc.A.isModal=true;
isc.A.showModalMask=true;
isc.A.canDragResize=true;
isc.A.showMappingTree=true;
isc.A.mappingTreeConstructor="TreeGrid";
isc.A.mappingTreeDefaults={
        autoParent:"mappingView",
        showOpenIcons:false,
        showDropIcons:false,
        showHover:false,
        customIconProperty:"customIcon",
        fields:[
            {name:"name",title:"Name",width:"60%",showHover:true},
            {name:"type",title:"Type"},
            {name:"primaryKey",title:"PK",type:"boolean",width:"10%"},
            {name:"length",title:"Length",type:"number"}
        ],
        sortField:"name",
        selectionChanged:function(record,state){
            if(state){
                var objectName=this.data.getLevel(record)==1?record.name:
                    this.data.getParent(record).name;
                if(objectName&&objectName!=this.creator._selectedEntity){
                    this.creator.getDataSourceFromMapping(objectName);
                    this.creator.populateDataViewHeader();
                }
            }
        },
        openFolder:function(node){
            if(this.data.getLevel(node)>1){
                return this.Super("openFolder",arguments);
            }
            this.Super("openFolder",arguments);
            var mappingTree=this;
            var className=node.name;
            isc.DMI.call("isc_builtin","com.isomorphic.tools.BuiltinRPC","getBeanFields",
                className,
                function(data){
                    mappingTree.populateFields(node,data.data);
                }
            );
        },
        getValueIcon:function(field,value,record){
            if(record.type=="entity"){
                return null;
            }else{
                return this.Super("getValueIcon",arguments);
            }
        },
        populateFields:function(node,paramData){
            var data=isc.clone(paramData)
            node.children=[];
            for(var i=0;i<data.length;i++){
                data[i].children=[];
                data[i].customIcon="[SKIN]../DatabaseBrowser/column.png";
            }
            this.data.addList(data,node);
        }
    };
isc.A.dataGridConstructor="ListGrid";
isc.A.dataGridDefaults={
    };
isc.A.title="Hibernate Browser";
isc.A.navToolbarConstructor="HLayout";
isc.A.navToolbarDefaults={
        height:22,
        layoutMargin:10,
        membersMargin:10,
        autoParent:"outerLayout"
    };
isc.A.showCancelButton=true;
isc.A.cancelButtonConstructor="Button";
isc.A.cancelButtonDefaults={
        title:"Cancel",
        autoParent:"navToolbar"
    };
isc.A.showSelectButton=true;
isc.A.selectButtonConstructor="Button";
isc.A.selectButtonDefaults={
        title:"Next >",
        enabled:false,
        autoParent:"navToolbar"
    };
isc.A.outerLayoutDefaults={
         _constructor:isc.VLayout,
         width:"100%",height:"100%",
         autoSize:true,autoDraw:true,
         autoParent:"body"
    };
isc.A.innerLayoutDefaults={
         _constructor:isc.HLayout,
         width:"100%",height:"100%",
         autoDraw:true,
         autoParent:"outerLayout"
    };
isc.A.showMappingView=true;
isc.A.mappingViewDefaults={
         _constructor:isc.SectionStack,
         autoParent:"innerLayout"
    };
isc.A.showDataView=true;
isc.A.dataViewDefaults={
         _constructor:isc.SectionStack,
         width:"65%",height:"100%",
         autoParent:"innerLayout"
    }
;

isc.A=isc.HibernateBrowser.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.B.push(isc.A.initWidget=function isc_HibernateBrowser_initWidget(){
    this.Super("initWidget",arguments);
    this.createChildren();
}
,isc.A.createChildren=function isc_HibernateBrowser_createChildren(){
    this.Super("createChildren");
    this.body.hPolicy="fill";
    this.body.vPolicy="fill";
    var hbBrowser=this;
    this.addAutoChild("outerLayout");
    this.addAutoChild("innerLayout",null,null,this.outerLayout);
    this.addAutoChild("mappingView",{showResizeBar:this.showDataView,
        title:"Hibernate Mappings"},null,this.innerLayout);
    this.mappingView.addSection({autoDraw:true,showHeader:true,expanded:true,
        hidden:false,title:"Hibernate Mappings"});
    this.mappingStack=this.mappingView.sections[0];
    this.addAutoChild("dataView",null,null,this.innerLayout);
    this.dataView.addSection({autoDraw:true,showHeader:true,expanded:true,hidden:false});
    this.dataStack=this.dataView.sections[0];
    this.mappingTree=this.createAutoChild("mappingTree");
    this.mappingStack.addItem(this.mappingTree);
    var includeList=this.includeSubstring;
    if(includeList&&!isc.isAn.Array(includeList))includeList=[includeList];
    var excludeList=this.excludeSubstring;
    if(excludeList&&!isc.isAn.Array(excludeList))excludeList=[excludeList];
    isc.DMI.call("isc_builtin","com.isomorphic.tools.BuiltinRPC","getHibernateBeans",
        includeList,excludeList,
        true,
        function(data){
            hbBrowser.populateMappingTree(data.data);
        }
    );
    this.dataGrid=this.createAutoChild("dataGrid");
    this.dataStack.addItem(this.dataGrid);
    this.addAutoChild("navToolbar",null,this.outerLayout);
    this.navToolbar.addMember(isc.LayoutSpacer.create());
    this.addAutoChild("cancelButton",{
        click:function(){
            hbBrowser.hide();
            hbBrowser.markForDestroy();
        }
    });
    this.addAutoChild("selectButton",{
        click:function(){
            hbBrowser.hide();
            hbBrowser._paletteNode.defaults=hbBrowser.getGeneratedDataSourceObject();
            hbBrowser.fireCallback(hbBrowser._getResultsCallback,"node",
                [hbBrowser._paletteNode])
        }
     });
}
,isc.A.populateMappingTree=function isc_HibernateBrowser_populateMappingTree(data){
    for(var i=0;i<data.length;i++){
        data[i].name=data[i].entityName;
        data[i].type="entity";
        data[i].isFolder=true;
        data[i].customIcon="[SKIN]../DatabaseBrowser/data.png"
    }
    this.mappingTree.setData(isc.Tree.create({
        modelType:"children",
        root:{children:data}
    }));
    if(data.length==0){
        this.populateMappingTreeHeader("No Hibernate entities configured");
    }
    this.tablesRetrieved=true;
}
,isc.A.populateMappingTreeHeader=function isc_HibernateBrowser_populateMappingTreeHeader(headerText){
    this.mappingStack.setTitle(headerText);
}
,isc.A.populateDataViewHeader=function isc_HibernateBrowser_populateDataViewHeader(){
    this.dataGridTitle="Data from entity "+this._selectedEntity;
    this.dataStack.setTitle(this.dataGridTitle);
}
,isc.A.getDataSourceFromMapping=function(entityName){

    var hbBrowser=this;
    hbBrowser._selectedEntity=entityName;
    hbBrowser.selectButton.setEnabled(true);
    isc.DMI.call("isc_builtin","com.isomorphic.tools.BuiltinRPC","getDataSourceJSONFromHibernateMapping",
        entityName,entityName+"-hibernateBrowser",
        function(rpcResponse,data){
            var temp="hbBrowser.generatedDataSourceObject = "+data;
            eval(temp);
            hbBrowser.generatedDataSource=isc.DataSource.create(hbBrowser.generatedDataSourceObject);
            if(hbBrowser.showDataView){
                hbBrowser.dataGrid.setDataSource(hbBrowser.generatedDataSource);
                hbBrowser.dataGrid.fetchData();
            }
        });
}
,isc.A.getGeneratedDataSource=function isc_HibernateBrowser_getGeneratedDataSource(){
    return this.generatedDataSource;
}
,isc.A.getGeneratedDataSourceObject=function isc_HibernateBrowser_getGeneratedDataSourceObject(){
    return this.generatedDataSourceObject;
}
,isc.A.getResults=function isc_HibernateBrowser_getResults(newNode,callback,palette){
    this._getResultsCallback=callback;
    this._paletteNode=newNode;
}
);
isc.B._maxIndex=isc.C+9;

isc.defineClass("SelectionOutline","Class");
isc.A=isc.SelectionOutline;
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.flashBorder="1px dashed white";
isc.A.flashCount=7;
isc.A.flashInterval=300;
isc.A.showLabel=true;
isc.A.labelSnapTo="TL";
isc.A.labelSnapEdge="BL";
isc.A.labelSnapOffset=-2;
isc.A.labelOpacity=100;
isc.A._dragHandleHeight=18;
isc.A._dragHandleWidth=18;
isc.A._dragHandleXOffset=-18;
isc.A._dragHandleYOffset=0;
isc.A.border="1px dashed #44ff44";
isc.A.labelBackgroundColor="#44ff44";
isc.B.push(isc.A.setBorder=function isc_c_SelectionOutline_setBorder(border){
        this.border=border;
    }
,isc.A.getBorder=function isc_c_SelectionOutline_getBorder(){
        return this.border;
    }
,isc.A.setLabelBackgroundColor=function isc_c_SelectionOutline_setLabelBackgroundColor(color){
        this.labelBackgroundColor=color;
    }
,isc.A.getLabelBackgroundColor=function isc_c_SelectionOutline_getLabelBackgroundColor(){
        return this.labelBackgroundColor;
    }
,isc.A.getSelectedState=function isc_c_SelectionOutline_getSelectedState(){
        var state={
            border:this.getBorder(),
            labelBackgroundColor:this.getLabelBackgroundColor(),
            selectedObject:this.getSelectedObject(),
            enableKeyMovement:this._allowKeyMovement,
            showingDragHandle:this._showingDragHandle,
            showingLabel:this._showingLabel,
            label:this._labelText,
            resizeFrom:this._resizeFrom
        };
        return state;
    }
,isc.A.setSelectedState=function isc_c_SelectionOutline_setSelectedState(state){
        if(state==null)return;
        this.setBorder(state.border);
        this.setLabelBackgroundColor(state.labelBackgroundColor);
        if(state.selectedObject){
            this.select(state.selectedObject,false,
                state.showingLabel,state.label,
                state.resizeFrom,state.enableKeyMovement);
            if(state.showingDragHandle)this.showDragHandle();
        }else{
            this.deselect();
        }
    }
,isc.A.select=function isc_c_SelectionOutline_select(name,flash,showLabel,label,resizeFrom,enableKeyMovement){
        var objects=name;
        if(isc.isA.String(name))objects=[window[name]];
        else if(!isc.isAn.Array(objects))objects=[objects];
        for(var i=0;i<objects.length;i++){
            var object=objects[i];
            if(!isc.isA.Canvas(object)&&!isc.isA.FormItem(object)){
                this.logInfo("Cannot hilite "+name+" - it is neither a Canvas nor a FormItem");
                return;
            }
        }
        this._allowKeyMovement=enableKeyMovement;
        if(showLabel==null&&objects.length==1)showLabel=true;
        if(!label&&(showLabel||(showLabel==null&&this.showLabel))){
            label="<b>"+object.toString()+"</b>";
        }
        var done=false,
            firstObject=(this._objects?this._objects[0]:null);
        for(var i=0;i<objects.length;i++){
            var object=objects[i];
            if(object==firstObject&&label==this._labelText&&
                ((showLabel&&this._showingLabel)||(!showLabel&&!this._showingLabel)))
            {
                if(!this._visible)this.showOutline();
                done=true;
            }
        }
        if(done){
            this.delayCall("_moveOutline",[],0);
            return;
        }
        this.logInfo("Selection changing from "+isc.SelectionOutline.getSelectedObject()+
            " to "+objects[0],"selectionOutline");
        this.deselect();
        this._createOutlines(objects);
        this._objects=[];
        this._objectCanvases=[];
        for(var i=0;i<objects.length;i++){
            var object=objects[i],
                objectCanvas=object
            ;
            if(isc.isA.FormItem(object)){
                if(!this._formItemProxyCanvas){
                    this._formItemProxyCanvas=isc.FormItemProxyCanvas.create();
                }
                objectCanvas=this._formItemProxyCanvas;
                objectCanvas.delayCall("setFormItem",[object]);
            }
            var outline=this._outlines[i];
            outline.top.canDragResize=false;
            outline.left.canDragResize=false;
            outline.bottom.canDragResize=false;
            outline.right.canDragResize=false;
            if(resizeFrom){
                if(!isc.isAn.Array(resizeFrom))resizeFrom=[resizeFrom];
                for(var j=0;j<resizeFrom.length;j++){
                    var edgeName=resizeFrom[j],
                        edge=null
                    ;
                    if(edgeName=="T"){
                        edge=outline.top;
                    }else if(edgeName=="L"){
                        edge=outline.left;
                    }else if(edgeName=="B"){
                        edge=outline.bottom;
                    }else if(edgeName=="R"){
                        edge=outline.right;
                    }else{
                        continue;
                    }
                    edge.resizeEdge=edgeName;
                    edge.dragTarget=objectCanvas;
                    edge.canDragResize=true;
                }
                this._resizeFrom=resizeFrom;
            }
            if(showLabel||(showLabel==null&&this.showLabel)){
                if(outline.label==null){
                    this._createLabel();
                }else{
                    outline.label.setBackgroundColor(this.labelBackgroundColor);
                }
                outline.label.setContents(label);
                this._showingLabel=true;
                this._labelText=label;
            }else{
                outline.label=null;
                this._showingLabel=false;
                this._labelText=null;
            }
            this._objects[i]=object;
            this._objectCanvases[i]=objectCanvas;
        }
        this._resetOutline();
        this._clearTools();
        this.delayCall("_moveOutline",[],0);
        this.delayCall("showOutline",[],0);
        if(objects.length==1){
            var object=objects[0];
            if(this.clipCanvas){
                this._observer.observe(this.clipCanvas,"resized",
                        "isc.Timer.setTimeout('isc.SelectionOutline._clipCanvasResized()',0)");
            }
            if(object.moved){
                this._observer.observe(object,"moved",
                        "isc.Timer.setTimeout('isc.SelectionOutline._moveOutline()',0)");
            }
            if(objectCanvas.parentMoved){
                this._observer.observe(objectCanvas,"parentMoved",
                        "isc.Timer.setTimeout('isc.SelectionOutline._moveOutline()',0)");
            }
            if(objectCanvas.parentResized){
                this._observer.observe(objectCanvas,"parentResized",
                        "isc.Timer.setTimeout('isc.SelectionOutline._parentResized()',0)");
            }
            if(objectCanvas.resized){
                this._observer.observe(objectCanvas,"resized",
                        "isc.Timer.setTimeout('isc.SelectionOutline._resizeOutline()',0)");
            }
            if(objectCanvas.dragResizeStart){
                this._observer.observe(objectCanvas,"dragResizeStart","isc.SelectionOutline.resizeStart()");
            }
            var scrollObj=isc.isA.FormItem(object)?object.form:object;
            while(scrollObj){
                if(scrollObj.scrolled){
                    this._observer.observe(scrollObj,"scrolled",
                            "isc.SelectionOutline._moveOutline()");
                }
                scrollObj=scrollObj.parentElement;
            }
            if(object.hide){
                this._observer.observe(object,"hide","isc.SelectionOutline.hideOutline()");
            }
            if(object.destroy){
                this._observer.observe(object,"destroy","isc.SelectionOutline.hideOutline()");
            }
            if(objectCanvas._visibilityChanged){
                this._observer.observe(objectCanvas,"_visibilityChanged","isc.SelectionOutline.visibilityChanged()");
            }
        }
        if(flash!=false)this._flashOutline()
    }
,isc.A.deselect=function isc_c_SelectionOutline_deselect(){
        this.hideOutline();
        if(this._observer&&this._objects&&this._objects[0]){
            var object=this._objects[0],
                objectCanvas=this._objectCanvases[0]||object
            ;
            if(this.clipCanvas)this._observer.ignore(this.clipCanvas,"resized");
            this._observer.ignore(object,"moved");
            this._observer.ignore(objectCanvas,"parentMoved");
            this._observer.ignore(objectCanvas,"parentResized");
            this._observer.ignore(objectCanvas,"resized");
            this._observer.ignore(objectCanvas,"dragResizeStart");
            this._observer.ignore(objectCanvas,"dragMove");
            this._observer.ignore(objectCanvas,"dragStop");
            this._observer.ignore(object,"hide");
            this._observer.ignore(object,"destroy");
            this._observer.ignore(objectCanvas,"_visibilityChanged");
            var scrollObj=isc.isA.FormItem(object)?object.form:object;
            while(scrollObj){
                this._observer.ignore(scrollObj,"scrolled");
                scrollObj=scrollObj.parentElement;
            }
            var outline=this._outlines[0];
            outline.top.canDragResize=false;
            outline.left.canDragResize=false;
            outline.bottom.canDragResize=false;
            outline.right.canDragResize=false;
            if(this._keyPressEventID){
                isc.Page.clearEvent("keyPress",this._keyPressEventID);
                delete this._keyPressEventID;
            }
        }
        this._objects=null;
        this._objectCanvases=null;
    }
,isc.A.getSelectedObject=function isc_c_SelectionOutline_getSelectedObject(){
        return(this._objects&&this._objects.length>0?this._objects[0]:null);
    }
,isc.A.getSelectedObjectCanvas=function isc_c_SelectionOutline_getSelectedObjectCanvas(){
        return(this._objectCanvases&&this._objectCanvases.length>0?this._objectCanvases[0]:null);
    }
,isc.A.isShowingLabel=function isc_c_SelectionOutline_isShowingLabel(){
        return this._showingLabel;
    }
,isc.A._createOutlines=function isc_c_SelectionOutline__createOutlines(objects){
        if(!isc.isAn.Array(objects))objects=[objects];
        if(this._outlines&&this._outlines.length>=objects.length){
            for(var i=this._outlines.length-1;i>=objects.length;i--){
                var outline=this._outlines[i];
                outline.top.destroy();
                outline.left.destroy();
                outline.bottom.destroy();
                outline.right.destroy();
            }
            this._outlines.length=objects.length;
            return;
        }
        if(!this._outlines)this._outlines=[];
        var baseProperties={
            _isOutline:true,
            getEventEdge:function(){
                return this.resizeEdge;
            },
            autoDraw:false,
            overflow:"hidden",
            border:this.border,
            padding:0
        }
        for(var i=0;i<objects.length;i++){
            if(this._outlines[i])continue;
            this._outlines[i]={
                top:isc.Canvas.create(isc.addProperties(baseProperties,{
                            snapTo:"T",
                            snapEdge:"B",
                            width:"100%",
                            height:2,
                            canDragResize:false,
                            resizeFrom:["T"]
                    })),
                left:isc.Canvas.create(isc.addProperties(baseProperties,{
                            snapTo:"L",
                            snapEdge:"R",
                            width:2,
                            height:"100%",
                            canDragResize:false,
                            resizeFrom:["L"]
                    })),
                bottom:isc.Canvas.create(isc.addProperties(baseProperties,{
                            snapTo:"B",
                            snapEdge:"T",
                            width:"100%",
                            height:2,
                            canDragResize:false,
                            resizeFrom:["B","BR"]
                        })),
                right:isc.Canvas.create(isc.addProperties(baseProperties,{
                            snapTo:"R",
                            snapEdge:"L",
                            width:2,
                            height:"100%",
                            canDragResize:false,
                            resizeFrom:["R","BR"]
                    }))
            }
        }
        if(!this._observer)this._observer=isc.Class.create();
    }
,isc.A._createLabel=function isc_c_SelectionOutline__createLabel(){
        var outline=this._outlines[0];
        if(this._cachedLabel){
            outline.label=this._cachedLabel;
            return;
        }
        this._cachedLabel=outline.label=isc.Label.create({
            autoDraw:true,top:-1000,left:-1000,
            autoFit:true,
            autoFitDirection:"both",
            padding:2,
            wrap:false,
            isMouseTransparent:true,
            backgroundColor:this.labelBackgroundColor,
            opacity:this.labelOpacity,
            snapTo:this.labelSnapTo,
            snapEdge:this.labelSnapEdge,
            snapOffsetTop:this.labelSnapOffset,
            mouseOver:function(){
                if(this._movedAway){
                    isc.Timer.clear(this._snapBackTimer);
                    isc.SelectionOutline._moveOutline();
                    this._movedAway=false;
                }else{
                    var _this=this;
                    this._slideAwayTimer=isc.Timer.setTimeout(function(){
                        _this._slideAway();
                    },300);
                }
            },
            mouseOut:function(){
                if(this._slideAwayTimer){
                    isc.Timer.clear(this._slideAwayTimer);
                    delete this._slideAwayTimer;
                }
            },
            _slideAway:function(){
                isc.Timer.clear(this._snapBackTimer);
                this._movedAway=true;
                this.animateMove(null,(this.getPageTop()+this.getVisibleHeight())-
                                         isc.SelectionOutline.labelSnapOffset,null,200);
                if(isc.SelectionOutline._leadingTools){
                    var tools=isc.SelectionOutline._leadingTools;
                    tools.animateMove(null,(tools.getPageTop()+this.getVisibleHeight())-
                            isc.SelectionOutline.labelSnapOffset,null,200);
                }
                if(isc.SelectionOutline._trailingTools){
                    var tools=isc.SelectionOutline._trailingTools;
                    tools.animateMove(null,(tools.getPageTop()+this.getVisibleHeight())-
                            isc.SelectionOutline.labelSnapOffset,null,200);
                }
                this._snapBackTimer=isc.Timer.setTimeout(function(){
                    isc.SelectionOutline._moveOutline();
                    if(isc.SelectionOutline._outlines[0].label){
                        isc.SelectionOutline._outlines[0].label._movedAway=false;
                    }
                },3000);
            }
        });
    }
,isc.A._resizeOutline=function isc_c_SelectionOutline__resizeOutline(){
        this.logInfo("Resizing selected object "+isc.SelectionOutline.getSelectedObject(),"selectionOutline");
        this._refreshOutline();
        this.resizeStop();
    }
,isc.A._moveOutline=function isc_c_SelectionOutline__moveOutline(){
        this.logInfo("Moving selected object "+isc.SelectionOutline.getSelectedObject(),"selectionOutline");
        this._refreshOutline();
    }
,isc.A._parentResized=function isc_c_SelectionOutline__parentResized(){
        this.logInfo("Parent of selected object resized "+isc.SelectionOutline.getSelectedObject(),"selectionOutline");
        this._refreshOutline();
    }
,isc.A._clipCanvasResized=function isc_c_SelectionOutline__clipCanvasResized(){
        this.logInfo("Clip canvas resized "+isc.SelectionOutline.getSelectedObject(),"selectionOutline");
        this._refreshOutline();
    }
,isc.A._refreshOutline=function isc_c_SelectionOutline__refreshOutline(){
        if(!this._objects)return;
        var targetCanvas=this.getSelectedObjectCanvas();
        if(!targetCanvas||targetCanvas.destroyed||targetCanvas.destroying){
            this.deselect();
            return;
        }
        for(var i=0;i<this._outlines.length;i++){
            var outline=this._outlines[i],
                object=this._objects[i]
            ;
            if(!object||object.destroyed||object.destroying)continue;
            var outlinePageRect=this._getObjectOutlineRect(object);
            if(outlinePageRect){
                var width=outlinePageRect[2],
                    height=outlinePageRect[3]
                ;
                outline.top.resizeTo(width,outline.top.height);
                outline.bottom.resizeTo(width,outline.bottom.height);
                outline.left.resizeTo(outline.left.width,height);
                outline.right.resizeTo(outline.right.width,height);
                var isACanvas=isc.isA.Canvas(object);
                for(var key in outline){
                    var piece=outline[key];
                    if(key=="_offscreen"||piece==null)continue;
                    if(isACanvas){
                        piece.show();
                        isc.Canvas.snapToEdge(outlinePageRect,piece.snapTo,piece,piece.snapEdge);
                    }else{
                        isc.Canvas.snapToEdge(object.getPageRect(),piece.snapTo,piece,
                                            piece.snapEdge);
                    }
                }
                delete outline._offscreen;
            }else{
                outline._offscreen=true;
                this.hideOutline();
            }
        }
        this.positionDragHandle();
        this.positionTools();
    }
,isc.A._flashOutline=function isc_c_SelectionOutline__flashOutline(){
        var borders=[this.border,this.flashBorder];
        for(var i=0;i<this.flashCount;i++){
            isc.Timer.setTimeout({
                    target:this,methodName:"_setOutline",
                    args:[borders[i%2]]
            },(this.flashInterval*i)
            )
        }
    }
,isc.A._resetOutline=function isc_c_SelectionOutline__resetOutline(){
        this._setOutline(this.border);
    }
,isc.A._setOutline=function isc_c_SelectionOutline__setOutline(border){
        for(var i=0;i<this._outlines.length;i++){
            var outline=this._outlines[i];
            for(var key in outline){
                if(key=="label"||key=="_offscreen")continue;
                var piece=outline[key];
                piece.setBorder(border);
            }
        }
    }
,isc.A._getObjectOutlineRect=function isc_c_SelectionOutline__getObjectOutlineRect(object){
        var clipCanvas=this.clipCanvas,
            outlinePageRect
        ;
        if(object&&clipCanvas){
            var clipPageRect=clipCanvas.getPageRect(),
                objectPageRect=object.getPageRect(),
                left=Math.max(clipPageRect[0],objectPageRect[0]),
                top=Math.max(clipPageRect[1],objectPageRect[1])
            ;
            if(objectPageRect[0]+objectPageRect[2]>=0&&
                objectPageRect[1]+objectPageRect[3]>=0&&
                top<clipPageRect[1]+clipPageRect[3]&&
                left<clipPageRect[0]+clipPageRect[2])
            {
                outlinePageRect=[
                    left,
                    top,
                    Math.min(clipPageRect[0]+clipPageRect[2],objectPageRect[0]+objectPageRect[2])-left,
                    Math.min(clipPageRect[1]+clipPageRect[3],objectPageRect[1]+objectPageRect[3])-top
                ];
            }
            if(outlinePageRect&&(outlinePageRect[2]<1||outlinePageRect[3]<1)){
                outlinePageRect=null;
            }
        }else{
            outlinePageRect=object.getPageRect();
        }
        return outlinePageRect;
    }
,isc.A.resizeStart=function isc_c_SelectionOutline_resizeStart(){
        var object=isc.SelectionOutline.getSelectedObject();
        if(object&&object.editProxy&&object.editProxy.resizeStart)object.editProxy.resizeStart();
    }
,isc.A.resizeStop=function isc_c_SelectionOutline_resizeStop(){
        var object=isc.SelectionOutline.getSelectedObject();
        if(object&&object.editProxy&&object.editProxy.resizeStart)object.editProxy.resizeStop();
    }
,isc.A.hideOutline=function isc_c_SelectionOutline_hideOutline(){
        if(!this._outlines)return;
        for(var i=0;i<this._outlines.length;i++){
            var outline=this._outlines[i];
            for(var key in outline){
                if(key!="_offscreen"&&outline[key])outline[key].hide();
            }
        }
        this._visible=false;
        this.hideDragHandle();
        this.hideTools();
    }
,isc.A.showOutline=function isc_c_SelectionOutline_showOutline(){
        if(!this._outlines||!this.getSelectedObject())return;
        var visible=false;
        for(var i=0;i<this._outlines.length;i++){
            var outline=this._outlines[i];
            for(var key in outline){
                if(key!="_offscreen"&&outline[key]){
                    if(outline._offscreen){
                        outline[key].hide();
                    }else{
                        outline[key].show();
                        visible=true;
                    }
                }
            }
        }
        this._visible=visible;
        if(visible){
            if(this._dragHandle&&this._showingDragHandle)this.showDragHandle();
            this.showTools();
        }
    }
,isc.A.showDragHandle=function isc_c_SelectionOutline_showDragHandle(){
        var dragTarget=this.getSelectedObject();
        if(!dragTarget)return;
        if(!this._dragHandle){
            var _this=this;
            this._dragHandle=isc.Img.create({
                src:"[SKIN]/../../ToolSkin/images/controls/dragHandle.gif",
                prompt:"Grab here to drag component. Hold down shift to drag without a snap grid.",
                width:this._dragHandleWidth,height:this._dragHandleHeight,
                cursor:"move",
                backgroundColor:"white",
                opacity:80,
                canDrag:true,
                canDrop:true,
                isMouseTransparent:true,
                mouseDown:function(){
                    this.dragIconOffsetX=isc.EH.getX()-
                                              isc.SelectionOutline._draggingObject.getPageLeft();
                    this.dragIconOffsetY=isc.EH.getY()-
                                              isc.SelectionOutline._draggingObject.getPageTop();
                    _this._mouseDown=true;
                    this.Super("mouseDown",arguments);
                },
                mouseUp:function(){
                    _this._mouseDown=false;
                }
            });
        }
        if(!dragTarget.editProxy){
            this._dragHandle.hide();
            return;
        }
        var objectCanvas=this.getSelectedObjectCanvas();
        if(!this._draggingObject||this._draggingObject!=objectCanvas){
            this._dragHandle.setProperties({dragTarget:objectCanvas});
            isc.Timer.setTimeout("isc.SelectionOutline.positionDragHandle()",0);
            this._draggingObject=objectCanvas;
            this._observer.observe(this._draggingObject,"dragMove",
                        "isc.SelectionOutline.positionDragHandle(true)");
            this._observer.observe(this._draggingObject,"dragStop",
                        "isc.SelectionOutline._mouseDown = false");
        }
        if(!this._keyPressEventID&&this._allowKeyMovement!=false){
            this._keyPressEventID=isc.Page.setEvent("keyPress",this);
        }
        this._dragHandle.show();
        this._showingDragHandle=true;
    }
,isc.A.positionDragHandle=function isc_c_SelectionOutline_positionDragHandle(offset){
        if(!this._dragHandle||!this._showingDragHandle||!this._draggingObject)return;
        var selected=this._draggingObject;
        if(selected.destroyed||selected.destroying){
            this.logWarn("target of dragHandle: "+isc.Log.echo(selected)+" is invalid: "+
                         selected.destroyed?"already destroyed"
                                            :"currently in destroy()");
            return;
        }
        var height=selected.getVisibleHeight();
        if(height<this._dragHandleHeight*2){
            this._dragHandleYOffset=Math.round((height-this._dragHandle.height)/2)-1;
        }else{
            this._dragHandleYOffset=-1;
        }
        if(selected.isA("FormItemProxyCanvas")&&!this._mouseDown){
            selected.syncWithFormItemPosition();
        }
        if(!selected)return;
        var outlinePageRect=this._getObjectOutlineRect(selected);
        if(outlinePageRect){
            var left=outlinePageRect[0]+this._dragHandleXOffset;
            if(offset){
                left+=selected.getOffsetX()-this._dragHandle.dragIconOffsetX;
            }
            this._dragHandle.setPageLeft(left);
            var top=outlinePageRect[1]+this._dragHandleYOffset;
            if(offset){
                top+=selected.getOffsetY()-this._dragHandle.dragIconOffsetY;
            }
            this._dragHandle.setPageTop(top);
            if(this._outlines[0].label)this._dragHandle.moveAbove(this._outlines[0].label);
            this._dragHandle.show();
        }else{
            this._dragHandle.hide();
        }
    }
,isc.A.hideDragHandle=function isc_c_SelectionOutline_hideDragHandle(){
        if(this._dragHandle&&this._showingDragHandle){
            this._dragHandle.hide();
            if(this._keyPressEventID){
                isc.Page.clearEvent("keyPress",this._keyPressEventID);
                delete this._keyPressEventID;
            }
            this._showingDragHandle=false;
        }
    }
,isc.A.showTrailingTools=function isc_c_SelectionOutline_showTrailingTools(tools){
        if(!tools)return;
        if(!isc.isAn.Array(tools))tools=[tools];
        if(!this._trailingTools){
            var layout=isc.HLayout.create({
                autoDraw:false,
                snapTo:this.labelSnapTo,
                snapEdge:this.labelSnapEdge,
                snapOffsetTop:this.labelSnapOffset,
                width:1,
                membersMargin:2,
                members:tools
            });
            this._trailingTools=layout;
        }else{
            var members=this._trailingTools.getMembers();
            var changed=(members.length!=tools.length);
            if(!changed){
                for(var i=0;i<members.length;i++){
                    if(members[i]!=tools[i]){
                        changed=true;
                        break;
                    }
                }
            }
            if(changed)this._trailingTools.setMembers(tools);
        }
    }
,isc.A.showLeadingTools=function isc_c_SelectionOutline_showLeadingTools(tools){
        if(!tools)return;
        if(!isc.isAn.Array(tools))tools=[tools];
        if(!this._leadingTools){
            var layout=isc.HLayout.create({
                autoDraw:true,top:-100,left:-100,
                snapTo:this.labelSnapTo,
                snapEdge:this.labelSnapEdge,
                snapOffsetTop:this.labelSnapOffset,
                backgroundColor:"white",
                opacity:80,
                width:1,
                membersMargin:2,
                members:tools
            });
            this._leadingTools=layout;
        }else{
            var members=this._leadingTools.getMembers();
            var changed=(members.length!=tools.length);
            if(!changed){
                for(var i=0;i<members.length;i++){
                    if(members[i]!=tools[i]){
                        changed=true;
                        break;
                    }
                }
            }
            if(changed)this._leadingTools.setMembers(tools);
        }
    }
,isc.A._clearTools=function isc_c_SelectionOutline__clearTools(){
        if(this._leadingTools){
            this._leadingTools.removeMembers(this._leadingTools.getMembers());
        }
        if(this._trailingTools){
            this._trailingTools.removeMembers(this._trailingTools.getMembers());
        }
    }
,isc.A.hideTools=function isc_c_SelectionOutline_hideTools(){
        if(this._leadingTools){
            this._leadingTools.hide();
        }
        if(this._trailingTools){
            this._trailingTools.hide();
        }
    }
,isc.A.showTools=function isc_c_SelectionOutline_showTools(){
        if(this._leadingTools){
            this._leadingTools.show();
        }
        if(this._trailingTools){
            this._trailingTools.show();
        }
    }
,isc.A.positionTools=function isc_c_SelectionOutline_positionTools(offset){
        if(!this._showingLabel)return;
        var targetCanvas=this.getSelectedObjectCanvas(),
            outline=this._outlines[0],
            outlinePageRect
        ;
        if(outline&&!outline._offscreen){
            outlinePageRect=this._getObjectOutlineRect(targetCanvas)
        }
        if(this._leadingTools&&outlinePageRect){
            var tools=this._leadingTools;
            tools.snapOffsetLeft=-1*tools.getVisibleWidth();
            tools.setHeight(outline.label.getVisibleHeight());
            isc.Canvas.snapToEdge(outlinePageRect,tools.snapTo,tools,tools.snapEdge);
            tools.show();
        }else if(this._leadingTools){
            this._leadingTools.hide();
        }
        if(this._trailingTools&&outlinePageRect){
            var tools=this._trailingTools;
            tools.snapOffsetLeft=outline.label.getVisibleWidth();
            tools.setHeight(outline.label.getVisibleHeight());
            isc.Canvas.snapToEdge(outlinePageRect,tools.snapTo,tools,tools.snapEdge);
            tools.show();
        }else if(this._trailingTools){
            this._trailingTools.hide();
        }
    }
,isc.A.hideProxyCanvas=function isc_c_SelectionOutline_hideProxyCanvas(){
        if(this._dragTargetProxy)this._dragTargetProxy.hide();
    }
,isc.A.visibilityChanged=function isc_c_SelectionOutline_visibilityChanged(){
        var object=isc.SelectionOutline.getSelectedObject();
        if(!object)return;
        if(object.isVisible())isc.SelectionOutline.showOutline();
        else isc.SelectionOutline.hideOutline();
    }
,isc.A.pageKeyPress=function isc_c_SelectionOutline_pageKeyPress(target,eventInfo){
        var object=isc.SelectionOutline.getSelectedObject();
        if(!object||!object.parentElement)return;
        var focusCanvas=object.ns.EH.getFocusCanvas();
        if((isc.isA.DynamicForm&&isc.isA.DynamicForm(focusCanvas))||
            (isc.isA.GridRenderer&&isc.isA.GridRenderer(focusCanvas)&&focusCanvas.grid&&focusCanvas.grid.getEditRow()!=null)||
            (isc.isAn.ImgTab&&isc.isAn.ImgTab(focusCanvas))||
            (isc.isA.SimpleTabButton&&isc.isA.SimpleTabButton(focusCanvas)))
        {
            return;
        }
        if(object.ns.EH.clickMaskUp())return;
        var keyName=isc.EH.getKey();
        if(keyName==null||
            (keyName!="Arrow_Up"&&keyName!="Arrow_Down"&&keyName!="Arrow_Left"&&keyName!="Arrow_Right"))
        {
            return;
        }
        var parent=object.parentElement,
            shiftPressed=isc.EH.shiftKeyDown(),
            vGap=(shiftPressed?1:parent.snapVGap),
            hGap=(shiftPressed?1:parent.snapHGap),
            delta=[0,0]
        ;
        switch(keyName){
            case"Arrow_Up":
                delta=[0,vGap*-1];
                break;
            case"Arrow_Down":
                delta=[0,vGap];
                break;
            case"Arrow_Left":
                delta=[hGap*-1,0];
                break;
            case"Arrow_Right":
                delta=[hGap,0];
                break;
        }
        if(delta[0]!=0||delta[1]!=0){
            if(object.snapTo){
                object.setSnapOffsetLeft((object.snapOffsetLeft||0)+delta[0]);
                object.setSnapOffsetTop((object.snapOffsetTop||0)+delta[1]);
            }else{
                object.moveBy(delta[0],delta[1]);
            }
        }
        return false;
    }
);
isc.B._maxIndex=isc.C+38;

isc.ClassFactory.defineClass("Repo","Class");
isc.A=isc.Repo.getPrototype();
isc.A.idField="id";
isc.A.viewNameField="viewName";
isc.A.objectField="object";
isc.A.objectFormat="js"
;

isc.A=isc.Repo.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.B.push(isc.A.init=function isc_Repo_init(){
    this.initDataSource();
}
,isc.A.initDataSource=function isc_Repo_initDataSource(){
    if(this.dataSource&&!isc.isA.DataSource(this.dataSource))
        this.dataSource=isc.DS.getDataSource(this.dataSource);
}
,isc.A.destroy=function isc_Repo_destroy(){
    this.Super("destroy",arguments);
}
,isc.A.loadObjects=function isc_Repo_loadObjects(context,callback){
}
,isc.A.loadObject=function isc_Repo_loadObject(context,callback){
}
,isc.A.saveObject=function isc_Repo_saveObject(contents,context,callback){
}
,isc.A.showLoadUI=function isc_Repo_showLoadUI(context,callback){
}
,isc.A.showSaveUI=function isc_Repo_showSaveUI(contents,context,callback){
}
,isc.A.isActive=function isc_Repo_isActive(){
    if(this._loadFileDialog&&this._loadFileDialog.isVisible())return true;
    if(this._saveFileDialog&&this._saveFileDialog.isVisible())return true;
    return false;
}
,isc.A.customFormatToJS=function isc_Repo_customFormatToJS(value){
    return value;
}
);
isc.B._maxIndex=isc.C+10;

isc.Repo.addClassProperties({
})
isc.Repo.registerStringMethods({
});
isc.ClassFactory.defineClass("ViewRepo","Repo");
isc.A=isc.ViewRepo.getPrototype();
isc.A.dataSource="Filesystem";
isc.A.idField="name";
isc.A.viewNameField="name";
isc.A.objectField="contents";
isc.A.objectFormat="xml"
;

isc.A=isc.ViewRepo.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.B.push(isc.A.loadObjects=function isc_ViewRepo_loadObjects(context,callback){
    this.initDataSource();
    var ds=this.dataSource,
        _this=this;
    ds.fetchData(context?context.criteria:null,
        function(dsResponse){
            _this.loadObjectsReply(dsResponse.data,context,callback);
        }
    );
}
,isc.A.loadObjectsReply=function isc_ViewRepo_loadObjectsReply(data,context,callback){
    this.fireCallback(callback,"objects, context",[data,callback]);
}
,isc.A.loadObject=function isc_ViewRepo_loadObject(context,callback){
    this.initDataSource();
    var ds=this.dataSource,
        _this=this;
    ds.fetchData(context?context.criteria:null,
        function(dsResponse){
            _this.loadObjectReply(dsResponse.data,context,callback);
        },{operationId:"loadFile"}
    );
}
,isc.A.loadObjectReply=function isc_ViewRepo_loadObjectReply(data,context,callback){
    var record=isc.isAn.Array(data)?data[0]:data,
        value=record[this.objectField]
    ;
    if(this.objectFormat=="custom"){
        value=this.customFormatToJS(value);
    }
    context[this.idField]=context.fileName=record[this.idField];
    context[this.viewNameField]=context.screenName=record[this.viewNameField];
    if(context.screenName.indexOf(".")>0)
        context.screenName=context.screenName.substring(0,context.screenName.indexOf("."));
    context[this.objectField]=value;
    context.record=record;
    this.fireCallback(callback,"contents,context",[value,context]);
}
,isc.A.createLoadDialog=function isc_ViewRepo_createLoadDialog(context){
    var dialog=isc.TLoadFileDialog.create({
        directoryListingProperties:{
            canEdit:false
        },
        title:"Load View",
        initialDir:context.caller.workspacePath,
        rootDir:context.caller.workspacePath,
        fileFilter:".xml$",
        actionStripControls:["spacer:10","pathLabel","previousFolderButton","spacer:10",
                 "upOneLevelButton","spacer:10",
                 "refreshButton","spacer:2"
        ]
    });
    dialog.show();
    dialog.hide();
    return dialog;
}
,isc.A.showLoadUI=function isc_ViewRepo_showLoadUI(context,callback){
    var _this=this;
    if(!this._loadFileDialog){
        this._loadFileDialog=isc.TLoadFileDialog.create({
            directoryListingProperties:{
                canEdit:false
            },
            title:"Load View",
            initialDir:context.caller.workspacePath,
            rootDir:context.caller.workspacePath,
            fileFilter:".xml$",
            actionStripControls:["spacer:10","pathLabel","previousFolderButton","spacer:10",
                     "upOneLevelButton","spacer:10",
                     "refreshButton","spacer:2"
            ],
            loadFile:function(fileName){
                var name=fileName;
                if(name.endsWith(".jsp")||name.endsWith(".xml")){
                    name=name.substring(0,name.lastIndexOf("."));
                }
                _this.loadObject(
                    isc.addProperties(
                        {},
                        this._loadContext,
                        {criteria:{path:this.currentDir+"/"+fileName}}
                        ),
                    this._loadCallback
                );
                this.hide();
            }
        });
    }else{
        this._loadFileDialog.directoryListing.data.invalidateCache();
    }
    this._loadFileDialog._loadContext=context;
    this._loadFileDialog._loadCallback=callback;
    this._loadFileDialog.show();
}
,isc.A.saveObject=function isc_ViewRepo_saveObject(contents,context,callback){
    var fileName=context.fileName,
        dotIndex=fileName.lastIndexOf("."),
        code=contents,
        _builder=context.caller
    ;
    this.initDataSource();
    code=code.replaceAll("dataSource=\"ref:","dataSource=\"");
    if(dotIndex!=null&&(fileName.endsWith(".jsp")||fileName.endsWith(".xml"))){
        fileName=fileName.substring(0,dotIndex);
    }
    var index=fileName.lastIndexOf("/");
    var screenName=index>=0?fileName.substring(index+1):fileName,
        fileNameWithoutExtension=_builder.workspacePath+"/"+screenName,
        xmlFileName=fileNameWithoutExtension+".xml",
        ds=this.dataSource
    ;
    context.screenName=screenName;
    ds.updateData({path:xmlFileName,contents:code},
        null,{operationId:"saveFile",showPrompt:!context.suppressPrompt}
    );
    var page='<%@ page contentType="text/html; charset=UTF-8"%>\n'+
        '<%@ taglib uri="http://www.smartclient.com/taglib" prefix="isomorphic" %>\n'+
        '<HTML><HEAD><TITLE>'+
        screenName+
        '</TITLE>\n'+
        '<isomorphic:loadISC skin="'+
        _builder.skin+
        '"'+
        (_builder.modulesDir?'modulesDir="'+_builder.modulesDir+'"':"")+
        (context.additionalModules?(' includeModules="'+context.additionalModules+'"'):"")
        +'/>\n </HEAD><BODY>\n';
    for(var i=0;i<_builder.globalDependencies.deps.length;i++){
        var dep=_builder.globalDependencies.deps[i];
        if(dep.type=="js"){
            page+='<SCRIPT SRC='+
            (dep.url.startsWith("/")?
                _builder.webRootRelWorkspace:
                _builder.basePathRelWorkspace+"/"
                )+
            dep.url+
            '></SCRIPT>\n';
        }
        else
            if(dep.type=="schema"){
                page+='<SCRIPT>\n<isomorphic:loadDS name="'+dep.id+'"/></SCRIPT>\n';
            }
            else
                if(dep.type=="ui"){
                    page+='<SCRIPT>\n<isomorphic:loadUI name="'+dep.id+'"/></SCRIPT>\n';
                }
                else
                    if(dep.type=="css"){
                        page+='<LINK REL="stylesheet" TYPE="text/css" HREF='+
                        (dep.url.startsWith("/")?
                            _builder.webRootRelWorkspace:
                            _builder.basePathRelWorkspace+"/"
                            )+
                        dep.url+
                        '>\n';
                    }
    }
    page+='<SCRIPT>\n'+
        'isc.Page.setAppImgDir("'+_builder.basePathRelWorkspace+'/graphics/");\n'+
        '<isomorphic:XML>\n'+code+'\n</isomorphic:XML>'+
        '</SCRIPT>\n'+
        '</BODY></HTML>';
    _builder.projectComponents._tempScreen=screenName;
    var jspFileName=fileNameWithoutExtension+".jsp";
    ds.updateData({path:jspFileName,contents:page},
        function(){
            if(callback){
                isc.Class.fireCallback(callback,"success,context",[true,context]);
            }
            if(context.suppressPrompt)return;
            var url=window.location.href;
            if(url.indexOf("?")>0)url=url.substring(0,url.indexOf("?"));
            url=url.substring(0,url.lastIndexOf("/"));
            url+=(url.endsWith("/")?"":"/")+_builder.workspaceURL+screenName+".jsp";
            isc.say("Your screen can be accessed at:<P>"+
                "<a target=_blank href='"+
                url+
                "'>"+
                url+
                "</a>");
        },
        {operationId:"saveFile",showPrompt:!context.suppressPrompt}
    );
    if(_builder.saveURL){
        isc.RPCManager.send(null,null,
            {
                actionURL:_builder.saveURL,
                useSimpleHttp:true,
                showPrompt:!context.suppressPrompt,
                params:{
                    screen:code
                }
            }
        );
    }
}
,isc.A.showSaveUI=function isc_ViewRepo_showSaveUI(contents,context,callback){
    var _builder=context.caller,
        _this=this,
        code=contents,
        explicitScreenName=(context.saveAs?"":context.screenName),
        _callback=callback
    ;
    if(!this._saveFileDialog){
        this._saveFileDialog=isc.TSaveFileDialog.create({
            title:"Save View",
            fileFilter:".xml$",
            visibility:"hidden",
            actionStripControls:["spacer:10","pathLabel","previousFolderButton","spacer:10","upOneLevelButton","spacer:10","refreshButton","spacer:2"],
            directoryListingProperties:{
                canEdit:false
            },
            initialDir:_builder.workspacePath,
            rootDir:_builder.workspacePath,
            saveFile:function(fileName){
                _this.saveObject(
                    this._saveCode,
                    isc.addProperties(
                        this._saveContext,
                        {fileName:fileName}
                        ),
                    this._saveCallback
                    );
                this.hide();
            }
        })
    }
    else{
        this._saveFileDialog.directoryListing.data.invalidateCache();
    }
    this._saveFileDialog._saveCode=code;
    this._saveFileDialog._saveContext=context;
    this._saveFileDialog._saveCallback=callback;
    if(explicitScreenName&&explicitScreenName!=""){
        return this._saveFileDialog.saveFile(explicitScreenName);
    }
    this._saveFileDialog.show();
}
);
isc.B._maxIndex=isc.C+8;

isc.ClassFactory.defineClass("DSViewRepo","Repo");
isc.A=isc.DSViewRepo.getPrototype();
isc.A.idField="id";
isc.A.viewNameField="viewName";
isc.A.objectField="object"
;

isc.A=isc.DSViewRepo.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.B.push(isc.A.loadObjects=function isc_DSViewRepo_loadObjects(context,callback){
    if(!this.dataSource){
        this.logWarn("No dataSource available in "+this.getClassName()+".loadObjects");
        return;
    }
    this.initDataSource();
    var ds=this.dataSource,
        _this=this;
    ds.fetchData(context.criteria,
        function(dsResponse){
            _this.loadObjectsReply(dsResponse.data,context,callback);
        }
    );
}
,isc.A.loadObjectsReply=function isc_DSViewRepo_loadObjectsReply(data,context,callback){
    this.fireCallback(callback,"data, context",[data,context]);
}
,isc.A.loadObject=function isc_DSViewRepo_loadObject(context,callback){
    if(!this.dataSource){
        this.logWarn("No dataSource available in "+this.getClassName()+".loadObject");
        return;
    }
    this.initDataSource();
    var _this=this,
        ds=this.dataSource;
    ds.fetchData(context.criteria,
        function(dsRequest){
            _this.loadObjectReply(dsRequest.data,context,callback);
        }
    );
}
,isc.A.loadObjectReply=function isc_DSViewRepo_loadObjectReply(data,context,callback){
    var record=isc.isAn.Array(data)?data[0]:data,
        value=record[this.objectField]
    ;
    if(this.objectFormat=="custom"){
        value=this.customFormatToJS(value);
    }
    context[this.idField]=record[this.idField];
    context[this.viewNameField]=context.screenName=record[this.viewNameField];
    context[this.objectField]=value;
    context.record=record;
    this.fireCallback(callback,"contents,context",[value,context]);
}
,isc.A.saveObject=function isc_DSViewRepo_saveObject(contents,context,callback){
    if(!this.dataSource){
        this.logWarn("No dataSource available in "+this.getClassName()+".saveObject");
        return;
    }
    this.initDataSource();
    var _this=this,
        ds=this.dataSource;
    contents=contents.replaceAll("dataSource=\"ref:","dataSource=\"");
    var record={};
    if(context[this.idField])record[this.idField]=context[this.idField];
    record[this.viewNameField]=context[this.viewNameField];
    record[this.objectField]=contents;
    if(!record[this.idField]){
        ds.addData(record,
            function(dsResponse){
                _this.saveObjectReply(dsResponse,callback,context);
            }
        );
    }else{
        ds.updateData(record,
            function(dsResponse){
                _this.saveObjectReply(dsResponse,callback,context);
            }
        );
    }
}
,isc.A.saveObjectReply=function isc_DSViewRepo_saveObjectReply(dsResponse,callback,context){
    if(callback)this.fireCallback(callback,"success",[true]);
}
,isc.A.showLoadUI=function isc_DSViewRepo_showLoadUI(context,callback){
    var _this=this;
    if(!this._loadFileDialog){
        this._loadFileDialog=isc.TLoadFileDialog.create({
            showPreviousFolderButton:false,
            showUpOneLevelButton:false,
            showCreateNewFolderButton:false,
            actionFormProperties:{
                process:function(){
                    if(this.validate())
                        this.creator.recordSelected(this.creator.directoryListing._lastRecord);
                }
            },
            directoryListingProperties:{
                canEdit:false,
                dataSource:this.dataSource,
                fields:[
                    {name:_this.idField,width:0},
                    {name:_this.viewNameField,width:"*"}
                ],
                recordDoubleClick:function(viewer,record){
                    if(record.isFolder){
                        this.creator.setDir(record.path);
                    }else{
                        this.creator.recordSelected(record);
                    }
                    return false;
                }
            },
            dataSource:this.dataSource,
            title:"Load View",
            fileFilter:".xml$",
            actionStripControls:["spacer:10","pathLabel","previousFolderButton","spacer:10",
                     "upOneLevelButton","spacer:10",
                     "refreshButton","spacer:2"
            ],
            recordSelected:function(record){
                this._loadContext.criteria={record:record};
                this._loadContext.criteria[_this.idField]=record[_this.idField];
                _this.loadObject(this._loadContext,this._loadCallback);
                this.hide();
            }
        })
    }else{
        this._loadFileDialog.directoryListing.data.invalidateCache();
    }
    this._loadFileDialog._loadContext=context;
    this._loadFileDialog._loadCallback=callback;
    this._loadFileDialog.show();
}
,isc.A.showSaveUI=function isc_DSViewRepo_showSaveUI(contents,context,callback){
    var _this=this;
    if(context.screenName){
        this.saveObject(contents,context,callback);
        return;
    }
    if(!this._saveFileDialog){
        this._saveFileDialog=isc.TSaveFileDialog.create({
            title:"Save File",
            actionButtonTitle:"Save",
            showPreviousFolderButton:false,
            showUpOneLevelButton:false,
            showCreateNewFolderButton:false,
            actionFormProperties:{
                process:function(){
                    if(this.validate())
                        this.creator.recordSelected(this.creator.directoryListing._lastRecord);
                }
            },
            directoryListingProperties:{
                canEdit:false,
                dataSource:this.dataSource,
                fields:[
                    {name:_this.idField,width:0},
                    {name:_this.viewNameField,width:"*"}
                ],
                recordDoubleClick:function(viewer,record){
                    if(record.isFolder){
                        this.creator.setDir(record.path);
                    }else{
                        this.creator.recordSelected(record);
                    }
                    return false;
                }
            },
            dataSource:this.dataSource,
            title:"Load View",
            fileFilter:".xml$",
            actionStripControls:["spacer:10","pathLabel","previousFolderButton","spacer:10",
                     "upOneLevelButton","spacer:10",
                     "refreshButton","spacer:2"
            ],
            recordSelected:function(record){
                var context=this._saveContext;
                if(record){
                    context.criteria[_this.idField]=record[_this.idField];
                    context.record=record;
                    context[_this.idField]=record[_this.idField];
                    context[_this.viewNameField]=record[_this.viewNameField];
                }else{
                    context[_this.viewNameField]=this.actionForm.getValue("fileName");
                    context[_this.idField]=null;
                }
                _this.saveObject(this._saveContents,context,this._saveCallback);
                this.hide();
            }
        })
    }else{
        this._saveFileDialog.directoryListing.data.invalidateCache();
    }
    this._saveFileDialog._saveContents=contents;
    this._saveFileDialog._saveContext=context;
    this._saveFileDialog._saveCallback=callback;
    this._saveFileDialog.show();
}
);
isc.B._maxIndex=isc.C+8;

isc.ClassFactory.defineClass("DSRepo","Repo");
isc.DSRepo.addProperties({
})
isc.A=isc.DSRepo.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.B.push(isc.A.loadObjects=function isc_DSRepo_loadObjects(context,callback){
    var _this=this;
    if(!this.dataSource){
        isc.DMI.call({
            appID:"isc_builtin",
            className:"com.isomorphic.tools.BuiltinRPC",
            methodName:"getDefinedDataSources",
            args:[],
            callback:function(response){
                _this.loadObjectsReply(response.data,context,callback);
            }
        });
    }else{
        this.initDataSource();
        this.dataSource.fetchData(context?context.criteria:null,
            function(dsResponse){
                _this.loadObjectsReply(dsResponse.data,context,callback);
            }
        );
    }
}
,isc.A.loadObjectsReply=function isc_DSRepo_loadObjectsReply(data,context,callback){
    this.fireCallback(callback,"objects, context",[data,context]);
}
,isc.A.showLoadUI=function isc_DSRepo_showLoadUI(context,callback){
    if(!this._pickDataSourceDialog){
        this._pickDataSourceDialog=isc.PickDataSourceDialog.create();
    }
    var self=this;
    this.loadObjects(null,function(data){
        self._pickDataSourceDialog.callback=function(records){
            if(!isc.isAn.Array(records))records=[records];
            self.fireCallback(callback,"records, context",[records,context]);
        }
        self._pickDataSourceDialog.setData(data);
        self._pickDataSourceDialog.show();
    });
}
);
isc.B._maxIndex=isc.C+3;

isc.ClassFactory.defineClass("PickDataSourceDialog","Window");
isc.A=isc.PickDataSourceDialog.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.title="DataSource Picker";
isc.A.autoCenter=true;
isc.A.modal=true;
isc.A.width=460;
isc.A.height=300;
isc.A.canDragResize=true;
isc.A.bodyConstructor="VLayout";
isc.A.dsListingDataSourceDefaults={
        _constructor:"DataSource",
        clientOnly:true,
        fields:[{
            name:"dsName",
            title:"ID",
            primaryKey:true
        },{
            name:"dsType",
            title:"Type",
            valueMap:{
                "sql":"SQL",
                "hibernate":"Hibernate",
                "jpa":"JPA 2.0",
                "jpa1":"JPA 1.0",
                "generic":"Generic",
                "projectFile":"Project File"
            }
        }]
    };
isc.A.dsListingDefaults={
        _constructor:"ListGrid",
        defaultFields:[{
            name:"dsName",
            width:"*"
        },{
            name:"dsType",
            width:150,
            filterOperator:"equals"
        }],
        emptyMessage:"Retrieving list of DataSources...",
        height:"*",
        selectionType:"multiple",
        canMultiSort:true,
        initialSort:[
            {property:"dsName",direction:"ascending"}
        ],
        showFilterEditor:true,
        filterOnKeypress:true,
        fetchDelay:500,
        recordDoubleClick:function(viewer,record){
            this.creator.dataSourceSelected(record);
            return false;
        },
        selectionUpdated:function(record){
            this.creator.pickButton.setDisabled(!record);
        }
    };
isc.A.pickButtonConstructor="Button";
isc.A.pickButtonDefaults={
        title:"Select DataSource",
        width:150,
        layoutAlign:"right",
        height:30,
        margin:5,
        action:function(){
            this.creator.dataSourceSelected(this.creator.dsListing.getSelectedRecords());
        }
    };
isc.B.push(isc.A.setData=function isc_PickDataSourceDialog_setData(data){
        this.dsListing.emptyMessage="No DataSources found.";
        this.dsListingDataSource.setCacheData(data);
        this.dsListing.fetchData(null,function(){
            this.creator.pickButton.setDisabled(true);
        });
    }
,isc.A.dataSourceSelected=function isc_PickDataSourceDialog_dataSourceSelected(record){
        this.hide();
        this.fireCallback(this.callback,"record",[record]);
    }
,isc.A.initWidget=function isc_PickDataSourceDialog_initWidget(){
        this.Super("initWidget",arguments);
        this.dsListingDataSource=this.createAutoChild("dsListingDataSource");
        this.dsListing=this.createAutoChild("dsListing",{
            dataSource:this.dsListingDataSource
        });
        this.pickButton=this.createAutoChild("pickButton");
        this.addItems([
            this.dsListing,
            this.pickButton
        ]);
    }
);
isc.B._maxIndex=isc.C+3;

if(!isc.TScrollbar)isc.defineClass("TScrollbar","Scrollbar");
if(!isc.TScrollthumb)isc.defineClass("TScrollThumb","ScrollThumb");
if(!isc.THScrollthumb)isc.defineClass("THScrollThumb","TScrollThumb");
if(!isc.TVScrollthumb)isc.defineClass("TVScrollThumb","TScrollThumb");
if(!isc.TSnapbar)isc.defineClass("TSnapbar","Snapbar");
if(!isc.TPropertySheet)isc.defineClass("TPropertySheet","PropertySheet");
if(!isc.TSectionStack)isc.defineClass("TSectionStack","SectionStack");
if(!isc.TSectionHeader)isc.defineClass("TSectionHeader","SectionHeader");
if(!isc.TImgSectionHeader)isc.defineClass("TImgSectionHeader","ImgSectionHeader");
if(!isc.TImgSectionHeader2)isc.defineClass("TImgSectionHeader2","TImgSectionHeader");
if(!isc.TButton)isc.defineClass("TButton","StretchImgButton");
if(!isc.TAutoFitButton)isc.defineClass("TAutoFitButton","TButton");
if(!isc.TMenuButton)isc.defineClass("TMenuButton","MenuButton");
if(!isc.TMenu)isc.defineClass("TMenu","Menu");
if(!isc.TTab)isc.defineClass("TTab","ImgTab")
if(!isc.TTabSet)isc.defineClass("TTabSet","TabSet")
if(!isc.TTreePalette)isc.defineClass("TTreePalette","TreePalette");
if(!isc.TEditTree)isc.defineClass("TEditTree","EditTree");
if(!isc.THTMLFlow)isc.defineClass("THTMLFlow","HTMLFlow");
if(!isc.TComponentEditor)isc.defineClass('TComponentEditor','ComponentEditor');
if(!isc.TDynamicForm)isc.defineClass('TDynamicForm','DynamicForm');
if(!isc.TLayout)isc.defineClass('TLayout','Layout');
if(!isc.TWindow)isc.defineClass("TWindow","Window");
if(!isc.TListGrid)isc.defineClass("TListGrid","ListGrid");
if(!isc.TTreeGrid)isc.defineClass("TTreeGrid","TreeGrid");
if(!isc.TListPalette)isc.defineClass('TListPalette','ListPalette');
if(!isc.TSaveFileDialog)isc.defineClass("TSaveFileDialog","SaveFileDialog");
if(!isc.TLoadFileDialog)isc.defineClass("TLoadFileDialog","LoadFileDialog");
isc.FormItem._commonCriteriaEditItemProps={
    init:function(){
        this.Super("init",arguments);
        this.updateState();
        if(!this.dataSource)this.observe(this.form,"itemChanged");
        if(!this.dataSource)this.observe(this.form,"valuesChanged");
        if(!this.dataSource&&this.targetRuleScope){
            this._ruleScopeDataSources=
                isc.Canvas.getAllRuleScopeDataSources(this.targetRuleScope,null,this.excludeAuthFromRuleScope);
        }
        if(!this.iconPrompt)this.iconPrompt="Edit criteria";
    },
    getDataSource:function(){
        var ds=this.dataSource;
        if(this.dataSource)return this.dataSource;
        if(!ds&&this.form){
            var values=this.form.getValues();
            if(values["dataSource"])ds=values["dataSource"];
            else if(values["optionDataSource"])ds=values["optionDataSource"];
        }
        if(ds&&isc.isA.String(ds))ds=isc.DS.get(ds);
        this._lastDS=ds;
        return ds;
    },
    destroy:function(){
        if(this.form){
            if(this.isObserving(this.form,"itemChanged"))this.ignore(this.form,"itemChanged");
            if(this.isObserving(this.form,"valuesChanged"))this.ignore(this.form,"valuesChanged");
        }
        if(this._ruleScopeDataSources){
            for(var i=0;i<this._ruleScopeDataSources.length;i++){
                var ds=this._ruleScopeDataSources[i];
                if(ds._tempScope){
                    ds.destroy();
                }
            }
        }
        this.Super("destroy",arguments);
    },
    itemChanged:function(){
        if(!this.destroyed)this.updateState();
    },
    valuesChanged:function(){
        if(!this.destroyed)this.updateState();
    },
    _editCriteria:function(criteria){
        if(!this.editorWindow)this.createEditorWindow();
        var builder=this.filterBuilder;
        builder.setDataSource(this.getDataSource());
        builder.setCriteria(criteria);
        builder.setTopOperatorAppearance(!criteria||
            isc.DataSource.canFlattenCriteria(criteria)?"radio":"bracket");
        this.editorWindow.show();
        builder.focus();
    },
    filterBuilderConstructor:isc.FilterBuilder,
    filterBuilderDefaults:{
        showModeSwitcher:true
    },
    editorWindowConstructor:isc.Window,
    editorWindowDefaults:{
        width:"80%",maxWidth:800,
        height:"50%",minHeight:300,maxHeight:800,
        canDragResize:true,
        autoCenter:true,isModal:true,showModalMask:true,
        title:"Define Criteria",
        bodyProperties:{layoutMargin:5,membersMargin:5}
    },
    instructionsConstructor:isc.HTMLFlow,
    instructionsDefaults:{
        width:"100%",
        isGroup:true,
        groupTitle:"Instructions",
        padding:5,
        contents:"Define field by field criteria below"
    },
    saveButtonText:"Save",
    clearButtonText:"Clear",
    _getCriteriaDescription:function(criteria,outputSettings){
        var ds=this.getDataSource();
        if(this.createRuleCriteria)ds=this._ruleScopeDataSources;
        if(criteria==null||isc.isA.emptyObject(criteria))return;
        var form=this.form,
            localComponent=form.currentComponent?form.currentComponent.liveObject:null;
        if(localComponent&&isc.isA.FormItem(localComponent)){
            localComponent=localComponent.form;
        }
        var description=isc.DS.getAdvancedCriteriaDescription(criteria,ds,localComponent,
                                                                outputSettings);
        return!description||description==""?null:description;
    },
    createEditorWindow:function(){
        var currentComponent=this.creator.currentComponent,
            excludedRuleScope=[]
        ;
        if(isc.isA.FormItem(currentComponent.liveObject)){
            var form=currentComponent.liveObject.form,
                ds=form.dataSource
            ;
            if(isc.isA.String(ds))ds=isc.DataSource.get(ds);
            excludedRuleScope.add((ds?ds.getID()+".":form.ID+".values.")+currentComponent.name);
            currentComponent=form;
        }
        var _this=this,
            instructions=this.createAutoChild("instructions"),
            filterBuilderProperties={
                targetRuleScope:this.targetRuleScope,
                allowRuleScopeValues:this.allowRuleScopeValues,
                createRuleCriteria:this.createRuleCriteria,
                targetComponent:currentComponent,
                _ruleScopeDataSources:this._ruleScopeDataSources,
                excludedRuleScope:excludedRuleScope
            },
            filterBuilder=this.createAutoChild("filterBuilder",filterBuilderProperties),
            saveButton=isc.IButton.create({
                title:this.saveButtonText,
                _item:this,
                click:function(){
                    var criteria=_this.filterBuilder.getCriteria();
                    _this.editCriteriaReply(criteria);
                    this._item.editorWindow.closeClick();
                }
            }),
            clearButton=isc.IButton.create({
                title:this.clearButtonText,
                click:function(){
                    _this.filterBuilder.clearCriteria();
                    var criteria=_this.filterBuilder.getCriteria();
                    _this.editCriteriaReply(criteria);
                }
            }),
            buttonLayout=isc.HLayout.create({
                align:"right",
                layoutMargin:10,
                membersMargin:10,
                members:[clearButton,saveButton]
            })
        ;
        this.editorWindow=this.createAutoChild("editorWindow",{
            items:[instructions,filterBuilder,buttonLayout]
        });
        this.filterBuilder=filterBuilder;
    }
};
isc.defineClass("CriteriaItem","StaticTextItem");
isc.A=isc.CriteriaItem.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.width="*";
isc.A.wrap=false;
isc.A.clipValue=true;
isc.A.noDataSourceHoverText="Add a DataSource to enable criteria editing";
isc.A.emptyDisplayValue="[None]";
isc.A.noDataSourceDisplayValue="[N/A]";
isc.A.simplifySingleCriterion=true;
isc.A.icons=[{
        src:"[SKINIMG]actions/edit.png",
        click:"item.editCriteria()"
    }];
isc.B.push(isc.A.formatValue=function isc_CriteriaItem_formatValue(value,record,form,item){
        var formattedValue=this._getCriteriaDescription(value);
        if(formattedValue==null){
            var ds=this.getDataSource();
            if(!ds&&!this.createRuleCriteria)formattedValue=this.noDataSourceDisplayValue;
            else formattedValue=this.emptyDisplayValue;
        }
        return formattedValue;
    }
,isc.A.updateState=function isc_CriteriaItem_updateState(){
        var lastDS=this._lastDS,
            ds=this.getDataSource()
        ;
        if(ds||this.createRuleCriteria){
            this.enable();
        }else{
            this.disable();
        }
        if(!this.createRuleCriteria&&lastDS!=null&&ds!=lastDS){
            this.storeValue(null,true);
        }
        this._lastDS=ds;
    }
,isc.A.itemHoverHTML=function isc_CriteriaItem_itemHoverHTML(item,form){
        return!this.getDataSource()&&!this.createRuleCriteria?
            this.noDataSourceHoverText:this.getDisplayValue();
    }
,isc.A.editCriteria=function isc_CriteriaItem_editCriteria(){
        var criteria=this.getValue();
        this._editCriteria(criteria);
    }
,isc.A.editCriteriaReply=function isc_CriteriaItem_editCriteriaReply(criteria){
        if(this.simplifySingleCriterion){
            if(criteria&&criteria.criteria&&criteria.criteria.length==1){
                criteria=criteria.criteria[0];
            }
        }
        if(criteria&&criteria.criteria&&criteria.criteria.isEmpty())criteria=null;
        this.storeValue(criteria,true);
    }
);
isc.B._maxIndex=isc.C+5;
isc.CriteriaItem.addProperties(isc.FormItem._commonCriteriaEditItemProps);

isc.defineClass("ExpressionItem","PopUpTextAreaItem");
isc.A=isc.ExpressionItem;
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.B.push(isc.A.getActionTitle=function isc_c_ExpressionItem_getActionTitle(value,builder,showTarget){
        var actionTitle;
        if(isc.isAn.Array(value)){
            var displayVals=[];
            for(var i=0;i<value.length;++i){
                var val=value[i];
                if(isc.isA.StringMethod(val)){
                    if(val.value&&val.value.target&&val.value.name){
                        var action=val.value;
                        displayVals.add(builder.getActionTitle(action.target,action.name,showTarget));
                    }else{
                        displayVals.add(val.getDisplayValue());
                    }
                }else if(isc.isAn.Object(val)){
                    if(val._constructor=="Process"){
                        displayVals.add("[workflow]");
                    }else{
                        displayVals.add(builder.getActionTitle(val.target,val.name,showTarget));
                    }
                }
            }
            actionTitle=displayVals.join(", ");
        }else if(isc.isA.StringMethod(value)){
            if(value.value&&value.value.target&&value.value.name){
                var action=value.value;
                actionTitle=builder.getActionTitle(action.target,action.name,showTarget);
            }else{
                actionTitle=value.getDisplayValue();
            }
        }else if(isc.isA.Function(value)){
            if(value.iscAction){
                if(value.iscAction._constructor=="Process"){
                    actionTitle="[workflow]";
                }else{
                    if(isc.isAn.Array(value.iscAction)){
                        actionTitle=value.iscAction.map(function(action){
                            return builder.getActionTitle(action.target,action.name,showTarget);
                        }).join(", ");
                    }else{
                        actionTitle=builder.getActionTitle(value.iscAction.target,value.iscAction.name,showTarget);
                    }
                }
            }else{
                actionTitle=isc.Func.getBody(value);
            }
        }else if(value&&value._constructor=="Process"){
            actionTitle="[workflow]";
        }else if(value&&value.target&&value.name){
            actionTitle=builder.getActionTitle(value.target,value.name,showTarget);
        }
        return actionTitle;
    }
);
isc.B._maxIndex=isc.C+1;

isc.A=isc.ExpressionItem.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.multiple=true;
isc.A.suppressMultipleComparisonWarning=true;
isc.A.textAreaWidth=400;
isc.A.showActionIcon=true;
isc.A.actionIconSrc="[SKIN]/actions/add.png";
isc.A.actionIconWidth=20;
isc.A.actionIconHeight=20;
isc.A.actionIconPosition=1;
isc.B.push(isc.A.mapValueToDisplay=function isc_ExpressionItem_mapValueToDisplay(value){
        var builder=this.creator.builder,
            actionTitle=isc.ExpressionItem.getActionTitle(value,builder,true)
        ;
        if(actionTitle)return actionTitle;
        else return this.Super("mapValueToDisplay",arguments);
    }
,isc.A.getValue=function isc_ExpressionItem_getValue(){
        var value=this.Super("getValue");
        if(isc.isA.Function(value)){
            return isc.Func.getBody(value);}
        else return value;
    }
,isc.A._setUpIcons=function isc_ExpressionItem__setUpIcons(){
        this.Super("_setUpIcons",arguments);
        if(this.showActionIcon){
            if(this.icons==null)this.icons=[];
            var position=this.actionIconPosition;
            this.icons.addAt({
                name:"action",
                src:this.actionIconSrc,
                showOver:false,
                canHover:true,
                hoverWrap:false,
                prompt:"Add action",
                width:this.actionIconWidth,
                height:this.actionIconHeight,
                click:function(form,item){
                    item.showActionMenu();
                    return false;
                }
            },position);
            this._setUpIcon(this.icons[position]);
        }
    }
,isc.A.updateAppearance=function isc_ExpressionItem_updateAppearance(newValue){
        this.setElementValue(this.mapValueToDisplay(newValue));
    }
,isc.A.showActionMenu=function isc_ExpressionItem_showActionMenu(){
        var currentStringMethods=[],
            value=this.getValue();
        if(isc.isA.Function(value)&&value.iscAction!=null){
            currentStringMethods.add(isc.StringMethod.create({value:value.iscAction}));
        }else if(isc.isA.StringMethod(value)){
            currentStringMethods.add(value);
        }else if(isc.isAn.Array(value)){
            for(var i=0;i<value.length;++i){
                var val=value[i];
                if(isc.isA.Function(val)&&val.iscAction!=null){
                    currentStringMethods.add(isc.StringMethod.create({value:val.iscAction}));
                }else if(isc.isA.StringMethod(val)){
                    currentStringMethods.add(val);
                }else if(isc.isAn.Object(val)){
                    currentStringMethods.add(isc.StringMethod.create({value:val}));
                }
            }
        }else if(isc.isAn.Object(value)){
            currentStringMethods.add(isc.StringMethod.create({value:value}));
        }
        var menu=this.actionMenu;
        if(menu==null){
            var item=this;
            menu=this.actionMenu=this.createAutoChild("actionMenu",{
                builder:this.creator.builder,
                sourceComponent:this.form.currentComponent,
                sourceMethod:this.name,
                components:this.form.allComponents,
                bindingComplete:function(bindings){
                    item._updateValue(bindings);
                }
            },"ActionMenu");
        }
        menu.currentStringMethods=currentStringMethods;
        menu.rawValue=this.Super("getValue");
        menu._showOffscreen();
        var iconRect=this.getIconPageRect(this.icons[1]);
        menu.placeNear(iconRect[0]+iconRect[2],
                       iconRect[1]+iconRect[3]);
        menu.show();
    }
);
isc.B._maxIndex=isc.C+5;

isc.defineClass("ActionMenuItem","StaticTextItem");
isc.A=isc.ActionMenuItem.getPrototype();
isc.A.canFocus=true;
isc.A.wrap=false;
isc.A.width=150;
isc.A.clipValue=true
;

isc.A=isc.ActionMenuItem.getPrototype();
isc.A.multiple=true;
isc.A.showActionIcon=true;
isc.A.actionIconSrc="[SKIN]/actions/add.png";
isc.A.actionIconWidth=20;
isc.A.actionIconHeight=20;
isc.A.mapValueToDisplay=isc.ExpressionItem.getPrototype().mapValueToDisplay;
isc.A.updateAppearance=isc.ExpressionItem.getPrototype().updateAppearance;
isc.A.actionIconPosition=0;
isc.A._setUpIcons=isc.ExpressionItem.getPrototype()._setUpIcons;
isc.A.showActionMenu=isc.ExpressionItem.getPrototype().showActionMenu
;

isc.defineClass("FormulaEditorItem","StaticTextItem");
isc.A=isc.FormulaEditorItem.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.width="*";
isc.A.wrap=false;
isc.A.clipValue=true;
isc.A.formulaVarsKey="formulaVars";
isc.A.emptyDisplayValue="[None]";
isc.A.icons=[{
        src:"[SKINIMG]actions/edit.png",
        prompt:"Edit formula fields",
        click:"item.editFormula()"
    }];
isc.A.editorWindowConstructor="Window";
isc.A.editorWindowDefaults={
        title:"Formula Editor",
        height:400,
        width:"80%",maxWidth:750,
        showMinimizeButton:false,
        showMaximizeButton:false,
        autoDraw:true,
        isModal:true,
        showModalMask:true,
        overflow:"visible",
        autoCenter:true,
        canDragResize:true,
        bodyProperties:{
            overflow:"visible"
        },
        headerIconProperties:{padding:1,
            src:"[SKINIMG]ListGrid/formula_menuItem.png"
        },
        closeClick:function(){
            this.items.get(0).completeEditing(true);
        }
    };
isc.A.formulaBuilderConstructor="FormulaBuilder";
isc.A.formulaBuilderDefaults={
        showTitleField:false,
        showAutoHideCheckBox:false,
        helpWindowDefaults:{minWidth:475},
        helpTextIntro:"Building a Formula<P>"+
            "The fields available when writing a formula are drawn from the widgets in your "+
            "Component Tree, such as ListGrids and DynamicForms, and from the set of all "+
            "DataSources linked to databound components in the Component Tree.  By looking "+
            "under the 'source' column for a given field, you can see beforehand what will "+
            "be inserted for you in the formula box if you click that row.<P></b>"+
            "For example, suppose you want population density from the record: "+
            "<b>{population:&nbsp;222000,&nbsp;area:&nbsp;200}</b>.<P>Your chosen formula "+
            "might look like:<ul>"+
            "<li><b>ListGrid0.selectedRecord.population / ListGrid0.selectedRecord.area</b> "+
            "if the record were the selected row of ListGrid0,"+
            "<li><b>DynamicForm0.values.population / DynamicForm0.values.area</b> if the "+
            "record were being edited by DynamicForm0, or"+
            "<li><b>countryDS.population / countryDS.area</b> if the record were "+
            "edited/selected in a databound component with DataSource CountryDS.</ul>"+
            "All of the above formulae generate the same result, <b>1110</b>, when applied "+
            "to the record.<P>"+
            "Note that if databound components are present, the above rules imply there may "+
            "be more than one way to refer to the same record.<P><b>"+
            "For basic arithmetic, type in symbols (+-/%) directly.<P>The following "+
            "functions are also available:",
        showSaveAddAnotherButton:false,
        allowBlankFormula:true,
        fireOnClose:function(){
            this.creator.userEditComplete(!this.cancelled);
        }
    };
isc.A.formulaBuilderProperties={
        formulaFormProperties:{titleOrientation:"top",numCols:1}
    };
isc.B.push(isc.A.destroy=function isc_FormulaEditorItem_destroy(){
        if(this._ruleScopeDataSources){
            for(var i=0;i<this._ruleScopeDataSources.length;i++){
                var ds=this._ruleScopeDataSources[i];
                if(ds._tempScope){
                    ds.destroy();
                }
            }
        }
        this.Super("destroy",arguments);
    }
,isc.A.formatValue=function isc_FormulaEditorItem_formatValue(value,record,form,item){
        if(value==null||value.text==null){
            return this.emptyDisplayValue;
        }
        var expandedFormula=value.text;
        if(!this.targetRuleScope){
            var vars=value[this.formulaVarsKey],
                keys=isc.getKeys(vars).sort()
            ;
            for(var i=0;i<keys.length;i++){
                var key=keys[i];
                expandedFormula=expandedFormula.replace(key,"${"+key+"}");
            }
            for(var i=0;i<keys.length;i++){
                var key=keys[i];
                expandedFormula=expandedFormula.replace(new RegExp("\\$\\{"+key+"\\}",'g'),vars[key]);
            }
        }
        return expandedFormula;
    }
,isc.A.getBuilderProperties=function isc_FormulaEditorItem_getBuilderProperties(){
        var properties={
            dataSource:this.form.creator.dataSource,
            dataSources:this.form.creator.dataSources,
            mathFunctions:isc.MathFunction.getDefaultFunctionNames()
        };
        if(this.targetRuleScope){
            properties.targetRuleScope=this.targetRuleScope;
            properties.localComponent=this.component;
            properties.sourceFieldColumnTitle="Field";
            properties.sourceDSColumnTitle="Source";
            properties.useMappingKeys=false;
        }else{
            properties.component=this.component;
            properties.useMappingKeys=true;
        }
        return properties;
    }
,isc.A.editFormula=function isc_FormulaEditorItem_editFormula(){
        if(this.formulaBuilder==null){
            this.formulaBuilder=this.createAutoChild("formulaBuilder",
                this.getBuilderProperties()
            );
            this.editorWindow=this.createAutoChild("editorWindow",{items:[this.formulaBuilder]});
        }
        if(this.targetRuleScope&&this.getValue()!=null)this.formulaBuilder.setValue(this.getValue().text);
        else this.formulaBuilder.setValue("");
        this.editorWindow.show();
    }
,isc.A.userEditComplete=function isc_FormulaEditorItem_userEditComplete(saveValue){
        if(saveValue){
            var formulaObj=this.formulaBuilder.getBasicValueObject(),
                formula,
                vars;
            if(formulaObj!=null){
                formula=formulaObj.text;
                vars=formulaObj[this.formulaVarsKey];
            }
            if(formula!=null){
                var value={text:formula};
                if(vars!=null)value[this.formulaVarsKey]=vars;
                this.storeValue(value);
            }else{
                this.storeValue(null);
            }
            this.redraw();
        }
        this.editorWindow.clear();
    }
);
isc.B._maxIndex=isc.C+5;

isc.defineClass("SummaryEditorItem","FormulaEditorItem");
isc.A=isc.SummaryEditorItem.getPrototype();
isc.A.formulaVarsKey="summaryVars";
isc.A.formulaBuilderConstructor="SummaryBuilder";
isc.A.formulaBuilderDefaults={
        showTitleField:false,
        showAutoHideCheckBox:false,
        showSaveAddAnotherButton:false,
        builderTypeText:"Formula",
        helpWindowDefaults:{minWidth:475},
        helpTextIntro:"Building a Summary",
        getHoverText:function(){
            var output=isc.SB.create();
            output.append("<b>",this.helpTextIntro,"</b> <P>");
            output.append("<b>A summary combines dynamic values taken from available fields "+
                          "with static text specified by the user.  A dynamic value is "+
                          "specified by wrapping an available field source with #&zwj;{ }, "+
                          "while everything else is copied directly into the output.<P>"+
                          "The available fields are drawn from the widgets in your "+
                          "Component Tree, such as ListGrids and DynamicForms, and from the "+
                          "set of all DataSources linked to databound components in the "+
                          "Component Tree.  By looking under the 'source' column for a given "+
                          "field, you can see beforehand what will be inserted for you in "+
                          "the formula box if you click that row.<P></b>");
            output.append("For example, suppose you want a summary describing the diet of "+
                          "an animal for the record: "+
                          "<b>{commonName:&nbsp;'Alligator',&nbsp;diet:&nbsp;'Carnivore'}"+
                          "</b>.<P>Your chosen summary might look like:<ul>");
            output.append("<li>'<b>The #&zwj;{ListGrid0.selectedRecord.commonName} is a(n) "+
                          "#&zwj;{ListGrid0.selectedRecord.diet}</b>' if the record were the "+
                          "selected row of ListGrid0,"+
                          "<li>'<b>The #&zwj;{DynamicForm0.values.commonName} is a(n) "+
                          "#&zwj;{DynamicForm0.values.diet}</b>' if the record were being "+
                          "edited by DynamicForm0, or"+
                          "<li>'<b>The #&zwj;{animals.commonName} is a(n) "+
                          "#&zwj;{animals.diet}</b>' if the record were edited/selected in "+
                          "a databound component with DataSource animals.</ul>");
            output.append("All of the above summaries generate the same result, '<b>The "+
                          "Alligator is a(n) Carnivore</b>', when applied to the record.<P>"+
                          "Note that if databound components are present, the above rules "+
                          "imply there may be more than one way to refer to the same "+
                          "record.");
            return output.release(false);
        },
        allowBlankFormula:true,
        insertEscapedKeys:true,
        fireOnClose:function(){
            this.creator.userEditComplete(!this.cancelled);
        }
    };
isc.A.formulaBuilderProperties={
        formulaFormProperties:{titleOrientation:"top",numCols:1}
    }
;

isc.defineClass("ExpressionEditorItem","FormulaEditorItem");
isc.A=isc.ExpressionEditorItem.getPrototype();
isc.A.formulaVarsKey="summaryVars";
isc.A.formulaBuilderDefaults={
        showTitleField:false,
        showAutoHideCheckBox:false,
        showSaveAddAnotherButton:false,
        builderTypeText:"Formula",
        allowBlankFormula:true,
        insertEscapedKeys:true,
        fireOnClose:function(){
            this.creator.userEditComplete(!this.cancelled);
        }
    }
;

isc.ExpressionEditorItem.changeDefaults("formulaBuilderDefaults",{
    supportedFieldTypes:["integer","float","date"]
});isc.defineClass("DynamicPropertyEditorItem","TextItem");
isc.A=isc.DynamicPropertyEditorItem.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.width="*";
isc.A.wrap=false;
isc.A.clipValue=true;
isc.A.height=22;
isc.A.formulaVarsKey="formulaVars";
isc.A.summaryVarsKey="summaryVars";
isc.A.cancelButtonTitle="Cancel";
isc.A.saveButtonTitle="Save";
isc.A.rightInlineIconsPadding=0;
isc.A.icons=[{
        imgOnly:true,
        src:{
        _base:isc.Canvas._blankImgURL,
            Over:"[SKINIMG]DynamicForm/dynamic.png",
            Focused:"[SKINIMG]DynamicForm/dynamic.png"
        },
        showOver:true,
        showOverWhen:"textBox",
        showFocused:true,
        inline:true,
        inlineIconAlign:"right",
        hspace:0,
        height:18,width:18,
        prompt:"Edit dynamic property",
        click:"item.editProperty()"
    }];
isc.A.editorWindowConstructor="Window";
isc.A.editorWindowDefaults={
        ID:"dynPropEditorWindow",
        title:"Dynamic Property Editor",
        height:400,
        width:"80%",maxWidth:750,
        showMinimizeButton:false,
        showMaximizeButton:false,
        autoDraw:true,
        isModal:true,
        showModalMask:true,
        dismissOnEscape:true,
        overflow:"visible",
        autoCenter:true,
        canDragResize:true,
        isRuleScope:true,
        bodyProperties:{
            overflow:"visible"
        },
        headerIconProperties:{padding:1,
            src:"[SKINIMG]actions/dynamic.png"
        },
        closeClick:function(){
            this.creator.closeWindow(true);
        }
    };
isc.A.typeSelectorFormConstructor="DynamicForm";
isc.A.typeSelectorFormDefaults={
        ID:"dynPropTypeSelector",
        width:"100%",
        numCols:2,
        autoFocus:true
    };
isc.A.typePickerDefaults={
        name:"type",type:"radioGroup",showTitle:false,
        vertical:false,endRow:true,colSpan:2,
        redrawOnChange:true,
        changed:function(form,item,value){
            form.creator.typeChanged(value);
        }
    };
isc.A.dataPathPickerDefaults={
        name:"dataPath",type:"RuleScopeSelectItem",title:"Other field",
        showIf:"form.getValue('type') == 'DataPath'"
    };
isc.A.stringTypePickerValueMap={
        "DataPath":"Value in other field",
        "Text Formula":"Text format based on other fields",
        "Formula":"Math formula using other fields"
    };
isc.A.numericTypePickerValueMap={
        "DataPath":"Value in other field",
        "Formula":"Math formula using other fields"
    };
isc.A.formulaBuilderConstructor="FormulaBuilder";
isc.A.formulaBuilderDefaults={
        showTitleField:false,
        showAutoHideCheckBox:false,
        helpWindowDefaults:{minWidth:475},
        helpTextIntro:"Building a Formula<P>"+
        "The fields available when writing a formula are drawn from the widgets in your "+
        "Component Tree, such as ListGrids and DynamicForms, and from the set of all "+
        "DataSources linked to databound components in the Component Tree.  By looking "+
        "under the 'source' column for a given field, you can see beforehand what will "+
        "be inserted for you in the formula box if you click that row.<P></b>"+
        "For example, suppose you want population density from the record: "+
        "<b>{population:&nbsp;222000,&nbsp;area:&nbsp;200}</b>.<P>Your chosen formula "+
        "might look like:<ul>"+
        "<li><b>ListGrid0.selectedRecord.population / ListGrid0.selectedRecord.area</b> "+
        "if the record were the selected row of ListGrid0,"+
        "<li><b>DynamicForm0.values.population / DynamicForm0.values.area</b> if the "+
        "record were being edited by DynamicForm0, or"+
        "<li><b>countryDS.population / countryDS.area</b> if the record were "+
        "edited/selected in a databound component with DataSource CountryDS.</ul>"+
        "All of the above formulae generate the same result, <b>1110</b>, when applied "+
        "to the record.<P>"+
        "Note that if databound components are present, the above rules imply there may "+
        "be more than one way to refer to the same record.<P><b>"+
        "For basic arithmetic, type in symbols (+-/%) directly.<P>The following "+
        "functions are also available:",
        showButtonLayout:false,
        allowBlankFormula:true,
        useMappingKeys:false,
        visibility:"hidden"
    };
isc.A.formulaBuilderProperties={
        formulaFormProperties:{titleOrientation:"top",numCols:1}
    };
isc.A.summaryVarsKey="summaryVars";
isc.A.summaryBuilderConstructor="SummaryBuilder";
isc.A.summaryBuilderDefaults={
        showTitleField:false,
        showAutoHideCheckBox:false,
        showSaveAddAnotherButton:false,
        builderTypeText:"Formula",
        helpWindowDefaults:{minWidth:475},
        helpTextIntro:"Building a Summary",
        getHoverText:function(){
            var output=isc.SB.create();
            output.append("<b>",this.helpTextIntro,"</b> <P>");
            output.append("<b>A summary combines dynamic values taken from available fields "+
                    "with static text specified by the user.  A dynamic value is "+
                    "specified by wrapping an available field source with #&zwj;{ }, "+
                    "while everything else is copied directly into the output.<P>"+
                    "The available fields are drawn from the widgets in your "+
                    "Component Tree, such as ListGrids and DynamicForms, and from the "+
                    "set of all DataSources linked to databound components in the "+
                    "Component Tree.  By looking under the 'source' column for a given "+
                    "field, you can see beforehand what will be inserted for you in "+
            "the formula box if you click that row.<P></b>");
            output.append("For example, suppose you want a summary describing the diet of "+
                    "an animal for the record: "+
                    "<b>{commonName:&nbsp;'Alligator',&nbsp;diet:&nbsp;'Carnivore'}"+
            "</b>.<P>Your chosen summary might look like:<ul>");
            output.append("<li>'<b>The #&zwj;{ListGrid0.selectedRecord.commonName} is a(n) "+
                    "#&zwj;{ListGrid0.selectedRecord.diet}</b>' if the record were the "+
                    "selected row of ListGrid0,"+
                    "<li>'<b>The #&zwj;{DynamicForm0.values.commonName} is a(n) "+
                    "#&zwj;{DynamicForm0.values.diet}</b>' if the record were being "+
                    "edited by DynamicForm0, or"+
                    "<li>'<b>The #&zwj;{animals.commonName} is a(n) "+
                    "#&zwj;{animals.diet}</b>' if the record were edited/selected in "+
            "a databound component with DataSource animals.</ul>");
            output.append("All of the above summaries generate the same result, '<b>The "+
                    "Alligator is a(n) Carnivore</b>', when applied to the record.<P>"+
                    "Note that if databound components are present, the above rules "+
                    "imply there may be more than one way to refer to the same "+
            "record.");
            return output.release(false);
        },
        showButtonLayout:false,
        allowBlankFormula:true,
        insertEscapedKeys:true,
        useMappingKeys:false,
        visibility:"hidden"
    };
isc.A.summaryBuilderProperties={
        formulaFormProperties:{titleOrientation:"top",numCols:1}
    };
isc.A.buttonLayoutDefaults={_constructor:"HLayout",
        width:"100%",
        height:20,
        layoutMargin:10,
        membersMargin:10,
        align:"right"
    };
isc.A.cancelButtonDefaults={_constructor:"IButton",
        autoParent:"buttonLayout",
        click:function(){
            this.creator.closeWindow(true);
        }
    };
isc.A.saveButtonDefaults={_constructor:"IButton",
        autoParent:"buttonLayout",
        click:function(){
            this.creator.closeWindow();
        }
    };
isc.B.push(isc.A.destroy=function isc_DynamicPropertyEditorItem_destroy(){
        if(this._ruleScopeDataSources){
            for(var i=0;i<this._ruleScopeDataSources.length;i++){
                var ds=this._ruleScopeDataSources[i];
                if(ds._tempScope){
                    ds.destroy();
                }
            }
        }
        this.Super("destroy",arguments);
    }
,isc.A.formatEditorValue=function isc_DynamicPropertyEditorItem_formatEditorValue(value,record,form,item){
        var dynamicProperty;
        if(value&&isc.isA.DynamicProperty(value)){
            dynamicProperty=value.dataPath||value;
        }else if(form&&form.currentComponent&&form.currentComponent.liveObject){
            dynamicProperty=(form.currentComponent.liveObject.getDynamicProperty
                    ?form.currentComponent.liveObject.getDynamicProperty(item.name):null);
        }
        if(dynamicProperty!=null){
            if(isc.isA.String(dynamicProperty)){
                return"[DataPath: \""+dynamicProperty+"\"]";
            }
            if(dynamicProperty.dataPath){
                return"[DataPath: \""+dynamicProperty.dataPath+"\"]";
            }
            var formula=dynamicProperty.formula||dynamicProperty.textFormula,
                expandedFormula=(formula?formula.text:"")
            ;
            if(!this.targetRuleScope){
                var varsKey=(dynamicProperty.formula?this.formulaVarsKey:this.summaryVarsKey),
                    vars=formula[varsKey],
                    keys=isc.getKeys(vars).sort()
                ;
                for(var i=0;i<keys.length;i++){
                    var key=keys[i];
                    expandedFormula=expandedFormula.replace(new RegExp(key,'g'),vars[key]);
                }
            }
            return"["+(dynamicProperty.textFormula?"Text ":"")+"Formula: \""+expandedFormula+"\"]";
        }
        return value;
    }
,isc.A.getBuilderProperties=function isc_DynamicPropertyEditorItem_getBuilderProperties(){
        var properties={
            dataSource:this.form.creator.dataSource,
            dataSources:this.form.creator.dataSources,
            mathFunctions:isc.MathFunction.getDefaultFunctionNames()
        };
        if(this.targetRuleScope){
            properties.targetRuleScope=this.targetRuleScope;
            if(this.simplifyComponentPaths!=false){
                properties.localComponent=this.component;
            }
            properties.sourceFieldColumnTitle="Field";
            properties.sourceDSColumnTitle="Source";
        }else{
            properties.component=this.component;
        }
        return properties;
    }
,isc.A.editProperty=function isc_DynamicPropertyEditorItem_editProperty(){
        delete this._suppressDynamicProperty;
        if(this.typeSelectorForm==null){
            var fields=[],
                valueMap=this.stringTypePickerValueMap
            ;
            if(this.type&&this.type.toLowerCase().indexOf("string")<0&&
                    this.type.toLowerCase().indexOf("url")<0)
            {
                valueMap=this.numericTypePickerValueMap;
            }
            fields.add(isc.addProperties({},this.typePickerDefaults,this.typePickerProperties,
                {valueMap:valueMap}));
            fields.add(isc.addProperties({},this.dataPathPickerDefaults,this.dataPathPickerProperties,
                    {targetRuleScope:this.targetRuleScope,targetComponent:this.component}));
            this.typeSelectorForm=this.createAutoChild("typeSelectorForm",{fields:fields});
            this.formulaBuilder=this.createAutoChild("formulaBuilder",
                this.getBuilderProperties()
            );
            this.summaryBuilder=this.createAutoChild("summaryBuilder",
                this.getBuilderProperties()
            );
            this.addAutoChild("buttonLayout");
            this.addAutoChild("cancelButton",{title:this.cancelButtonTitle});
            this.addAutoChild("saveButton",{title:this.saveButtonTitle});
            this.editorWindow=this.createAutoChild("editorWindow",{
                items:[this.typeSelectorForm,this.formulaBuilder,this.summaryBuilder,this.buttonLayout]
            });
        }
        this.formulaBuilder.setFormula("");
        this.summaryBuilder.setFormula("");
        var form=this.form;
        var dynamicProperty=(form&&form.currentComponent&&form.currentComponent.liveObject.getDynamicProperty
                ?form.currentComponent.liveObject.getDynamicProperty(this.name):this.getValue());
        if(!dynamicProperty){
            this.typeSelectorForm.setValues({type:"DataPath",dataPath:""});
        }else{
            if(isc.isA.String(dynamicProperty)){
                this.typeSelectorForm.setValues({type:"DataPath",dataPath:dynamicProperty});
            }else if(dynamicProperty.dataPath){
                this.typeSelectorForm.setValues({type:"DataPath",dataPath:dynamicProperty.dataPath});
            }else if(dynamicProperty.formula){
                this.typeSelectorForm.setValues({type:"Formula"});
                if(this.targetRuleScope){
                    var formulaText=dynamicProperty.formula.text;
                    formulaText=formulaText.replace(/\(([^\)]*)\)\.toString\(\)/,"$1");
                    this.formulaBuilder.setValue(formulaText);
                }
            }else if(dynamicProperty.textFormula){
                this.typeSelectorForm.setValues({type:"Text Formula"});
                if(this.targetRuleScope){
                    var formulaText=dynamicProperty.textFormula.text;
                    this.summaryBuilder.setValue(formulaText);
                }
            }else{
                this.typeSelectorForm.setValues({type:"DataPath",dataPath:""});
            }
        }
        if(this.fixedType){
            this.typeSelectorForm.setValue("type",this.fixedType);
            this.typeSelectorForm.hide();
        }
        this.typeChanged(this.typeSelectorForm.getValue("type"));
        this.editorWindow.show();
    }
,isc.A.closeWindow=function isc_DynamicPropertyEditorItem_closeWindow(cancel){
        if(!cancel){
            var type=this.typeSelectorForm.getValue("type"),
                prop;
            if(type=="DataPath"){
                var dataPath=this.typeSelectorForm.getValue("dataPath");
                if(dataPath&&dataPath.length>0){
                    prop=isc.DynamicProperty.create({name:this.name,dataPath:dataPath});
                    var fieldDetails=this.targetRuleScope.getRuleContextPathDetails(dataPath),
                        ruleContextField=fieldDetails&&fieldDetails.field,
                        ruleContextFieldType=ruleContextField&&ruleContextField.type
                    ;
                    if(ruleContextFieldType){
                        var sourceType=isc.SimpleType.getBaseType(ruleContextFieldType),
                            targetType=isc.SimpleType.getBaseType(this.type);
                        if(sourceType!=targetType){
                            prop.type=targetType;
                        }
                    }
                }
            }else if(type=="Formula"){
                var formula=this.getFormula(this.formulaBuilder,this.formulaVarsKey,true);
                if(formula){
                    prop=isc.DynamicProperty.create({name:this.name,formula:formula});
                }
            }else if(type=="Text Formula"){
                var formula=this.getFormula(this.summaryBuilder,this.summaryVarsKey);
                if(formula){
                    prop=isc.DynamicProperty.create({name:this.name,textFormula:formula});
                }
            }
            this.storeValue(prop);
            this.redraw();
        }
        this.editorWindow.clear();
    }
,isc.A.typeChanged=function isc_DynamicPropertyEditorItem_typeChanged(type){
        if(type=="Formula")this.formulaBuilder.show()
        else this.formulaBuilder.hide();
        if(type=="Text Formula")this.summaryBuilder.show()
        else this.summaryBuilder.hide();
    }
,isc.A.storeValue=function isc_DynamicPropertyEditorItem_storeValue(newValue,showValue){
        if(isc.isA.String(newValue)){
            var formattedValue=this.formatEditorValue(this.getValue(),null,this.form,this);
            if(newValue==formattedValue)return;
        }
        this.Super("storeValue",arguments);
    }
,isc.A.getFormula=function isc_DynamicPropertyEditorItem_getFormula(builder,varsKey,mathFormula){
        var formulaObj=builder.getBasicValueObject(),
            formula,
            vars
        ;
        if(formulaObj!=null){
            formula=formulaObj.text;
            vars=formulaObj[this.formulaVarsKey];
        }
        if(formula!=null){
            if(mathFormula&&this.type&&this.type.toLowerCase().indexOf("string")>=0){
                formula="("+formula+").toString()";
            }
            var value={text:formula};
            if(vars!=null)value[varsKey]=vars;
            return value;
        }
        return null;
    }
);
isc.B._maxIndex=isc.C+8;

isc.defineClass("RuleScopeSelectItem","SelectItem");
isc.A=isc.RuleScopeSelectItem.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.textMatchStyle="startsWith";
isc.A.hint="Choose a field";
isc.A.showHintInField=true;
isc.A.valueField="name";
isc.A.pickListProperties={
        showHeader:false,
        reusePickList:function(){return false;},
        formatCellValue:function(value,record,rowNum,colNum){
            return(record.enabled==false||this.multiDSFieldFormat=="qualified"?value:"&nbsp;&nbsp;"+value);
        },
        recordClick:function(viewer,record,recordNum,field,fieldNum,value,rawValue){
            if(record.criteriaPath){
                record=isc.addProperties({},record);
                record.name=record.criteriaPath;
            }
            return this.Super("recordClick",[viewer,record,recordNum,field,fieldNum,value,rawValue]);
        }
    };
isc.A.multiDSFieldFormat="separated";
isc.B.push(isc.A.init=function isc_RuleScopeSelectItem_init(){
        var canvas=this.targetRuleScope,
            targetRuleScope=(isc.isA.String(canvas)?window[canvas]:this.targetRuleScope),
            targetComponent=this.targetComponent
        ;
        if(!this._ruleScopeDataSources){
            this._ruleScopeDataSources=isc.Canvas.getAllRuleScopeDataSources(targetRuleScope);
            this._destroyRuleScopeDataSources=true;
        }
        var ds=isc.Canvas.getMultiDSFieldDataSource(targetRuleScope,this._ruleScopeDataSources,targetComponent,this.excludedRuleScope,this.multiDSFieldFormat);
        var pathField=(this.multiDSFieldFormat=="separated"?"title":"name");
        this.optionDataSource=ds;
        this.displayField=pathField;
        this.pickListFields=[
            {name:"name",type:"text",hidden:(pathField!="name")},
            {name:"title",type:"text",hidden:(pathField!="title")}
        ];
        this.Super("init",arguments);
        this.ruleScopeDS=ds;
        this._targetRuleScope=targetRuleScope;
    }
,isc.A.destroy=function isc_RuleScopeSelectItem_destroy(){
        if(this.ruleScopeDS){
            this.ruleScopeDS.destroy();
        }
        if(this._ruleScopeDataSources&&this._destroyRuleScopeDataSources){
            for(var i=0;i<this._ruleScopeDataSources.length;i++){
                var ds=this._ruleScopeDataSources[i];
                if(ds._tempScope){
                    ds.destroy();
                }
            }
        }
        this.Super("destroy",arguments);
    }
);
isc.B._maxIndex=isc.C+2;

isc.defineClass("CheckboxDynamicPropertyItem","CheckboxItem");
isc.A=isc.CheckboxDynamicPropertyItem.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.dynamicValueHoverText="Checked when: ${critDesc} Click the checkbox to remove dynamic value and change to a fixed value";
isc.A.labelAsTitle=true;
isc.A.icons=[{
        imgOnly:true,
        src:{
            _base:isc.Canvas._blankImgURL,
            Over:"[SKINIMG]DynamicForm/dynamic.png",
            Focused:"[SKINIMG]DynamicForm/dynamic.png"
        },
        showOver:true,
        showOverWhen:"item",
        showFocused:true,
        hspace:0,
        height:18,width:18,
        prompt:"Edit dynamic property",
        click:"item.editCriteria()"
    }];
isc.B.push(isc.A.updateState=function isc_CheckboxDynamicPropertyItem_updateState(){
        var lastDS=this._lastDS,
            ds=this.getDataSource()
        ;
        this.showIcons=ds||this.createRuleCriteria;
        if(this._getDynamicValue(this.getValue())&&lastDS!=null&&ds!=lastDS){
            this.storeValue(null,true);
        }
        this._lastDS=ds;
    }
,isc.A._getDynamicValue=function isc_CheckboxDynamicPropertyItem__getDynamicValue(value){
        if(isc.isAn.Instance(value))return value;
        var component=this.form&&this.form.currentComponent;
        if(component&&component.liveObject&&component.liveObject.getDynamicProperty){
            return component.liveObject.getDynamicProperty(this.name);
        }
    }
,isc.A._mapValue=function isc_CheckboxDynamicPropertyItem__mapValue(value,checkedValue,uncheckedValue,partialSelectedValue,unsetValue){
        if(this._getDynamicValue(value))return partialSelectedValue;
        return this.invokeSuper(isc.CheckboxDynamicPropertyItem,"_mapValue",value,
                                checkedValue,uncheckedValue,partialSelectedValue,unsetValue);
    }
,isc.A.itemHoverHTML=function isc_CheckboxDynamicPropertyItem_itemHoverHTML(){
        var dynamicProp=this._getDynamicValue(this.getValue());
        if(!dynamicProp)return;
        var criteria=isc.DS.simplifyAdvancedCriteria(dynamicProp.trueWhen,true);
        if(!criteria)return;
        var critDesc="<ul>"+this._getCriteriaDescription(criteria,{
            prefix:"<li>",suffix:"</li>"
        })+"</ul>";
        return this.dynamicValueHoverText.evalDynamicString(this,{critDesc:critDesc});
    }
,isc.A.editCriteria=function isc_CheckboxDynamicPropertyItem_editCriteria(){
        delete this._suppressDynamicProperty;
        var dynamicProperty=this._getDynamicValue()||this.getValue();
        var criteria=dynamicProperty&&dynamicProperty.trueWhen?
                                          dynamicProperty.trueWhen:dynamicProperty;
        if(!isc.DS.isAdvancedCriteria(criteria))criteria=null;
        this._editCriteria(criteria);
    }
,isc.A.editCriteriaReply=function isc_CheckboxDynamicPropertyItem_editCriteriaReply(criteria){
        if(criteria==null)criteria={};
        if(isc.isAn.Object(criteria)&&!isc.DS.isAdvancedCriteria(criteria)){
            criteria=isc.DS.convertCriteria(criteria,null,this.getDataSource());
        }
        var form=this.form,
            prop=isc.DynamicProperty.create({name:this.name,trueWhen:criteria});
        this.storeValue(prop,true);
    }
);
isc.B._maxIndex=isc.C+6;
isc.CheckboxDynamicPropertyItem.addProperties(isc.FormItem._commonCriteriaEditItemProps);

isc.defineClass("ValuesManagerChooserItem","SelectItem");
isc.A=isc.ValuesManagerChooserItem;
isc.A.CREATE_VM="_create_";
isc.A.LEAVE_VM="_leave_"
;

isc.A=isc.ValuesManagerChooserItem.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.separateSpecialValues=true;
isc.A.valueField="id";
isc.A.displayField="name";
isc.A.sortField="id";
isc.A.pickListProperties={
        showHover:true,
        canHover:true,
        showHoverOnDisabledCells:true,
        cellHoverHTML:function(record,rowNum,colNum){
            if(record.enabled==false){
                var formItem=this.formItem,
                    component=formItem.getComponent(),
                    dataSource=component.liveObject.getDataSource()
                ;
                return"This ValuesManager cannot be joined because it uses DataSource '"+
                       record.dataSource.ID+"' "+
                       "while your form uses DataSource '"+dataSource.ID+"'";
            }
            return null;
        }
    };
isc.A.editorWindowConstructor="Window";
isc.A.editorWindowDefaults={
        ID:"vmChooserEditorWindow",
        title:"Create Values Manager",
        width:400,
        height:125,
        showMinimizeButton:false,
        showMaximizeButton:false,
        autoDraw:false,
        isModal:true,
        showModalMask:true,
        dismissOnEscape:true,
        autoCenter:true,
        closeClick:function(){
            this.creator.closeWindow(true);
        }
    };
isc.A.mainLayoutDefaults={_constructor:"VLayout",
        width:390,
        layoutMargin:10,
        membersMargin:10
    };
isc.A.nameFormDefaults={_constructor:"DynamicForm",
        autoParent:"mainLayout",
        width:"100%",
        wrapItemTitles:false
    };
isc.A.buttonLayoutDefaults={_constructor:"HLayout",
        autoParent:"mainLayout",
        width:"100%",
        height:30,
        membersMargin:10,
        align:"right"
    };
isc.A.cancelButtonDefaults={_constructor:"IButton",
        autoParent:"buttonLayout",
        title:"Cancel",
        click:function(){
            this.creator.closeWindow(true);
        }
    };
isc.A.saveButtonDefaults={_constructor:"IButton",
        autoParent:"buttonLayout",
        title:"Create",
        click:function(){
            this.creator.closeWindow();
        }
    };
isc.B.push(isc.A.init=function isc_ValuesManagerChooserItem_init(){
        this.specialValues=this.getSpecialValues();
        this._vmData=this.createValuesManagerData(this.getExistingValuesManagerNodes());
        this.Super("init",arguments);
    }
,isc.A.destroy=function isc_ValuesManagerChooserItem_destroy(){
        if(this._vmDataSource)this._vmDataSource.destroy();
        this.Super("destroy",arguments);
    }
,isc.A.change=function isc_ValuesManagerChooserItem_change(form,item,value,oldValue){
        if(value==isc.ValuesManagerChooserItem.CREATE_VM){
            this.createValuesManager();
            return false;
        }else if(value==isc.ValuesManagerChooserItem.LEAVE_VM){
            this.leaveValuesManager();
            return false;
        }else if(form.currentComponent.liveObject.getDataSource()==null){
            var vm=window[value];
            if(vm){
                var ds=vm.getDataSource();
                if(ds){
                    this.setComponentDataSource(ds);
                }
            }
        }
    }
,isc.A.getSpecialValues=function isc_ValuesManagerChooserItem_getSpecialValues(){
        var values={};
        values[isc.ValuesManagerChooserItem.CREATE_VM]="Create...";
        var vm=this.getValue();
        if(vm){
            if(!isc.isA.String(vm))vm=vm.getID();
            values[isc.ValuesManagerChooserItem.LEAVE_VM]="Leave current VM ("+vm+")";
        }
        return values;
    }
,isc.A.getOptionDataSource=function isc_ValuesManagerChooserItem_getOptionDataSource(){
        if(!this._vmDataSource){
            this._vmDataSource=isc.DS.create({
                clientOnly:true,
                fields:[
                    {name:"id",primaryKey:true},
                    {name:"name"}
                ],
                cacheData:this._vmData
            });
        }
        return this._vmDataSource;
    }
,isc.A.mapValueToDisplay=function isc_ValuesManagerChooserItem_mapValueToDisplay(value){
        var origValue=value;
        if(value!=null){
            if(!isc.isA.String(value))value=value.getID();
        }
        return value;
    }
,isc.A.getComponent=function isc_ValuesManagerChooserItem_getComponent(){
        return this.creator.currentComponent;
    }
,isc.A.getEditContext=function isc_ValuesManagerChooserItem_getEditContext(){
        var editor=this.creator,
            editNode=editor.currentComponent,
            currentComponent=editNode.liveObject,
            editContext=currentComponent.editContext
        ;
        return editContext;
    }
,isc.A.getExistingValuesManagerNodes=function isc_ValuesManagerChooserItem_getExistingValuesManagerNodes(){
        var editor=this.creator,
            editNode=editor.currentComponent,
            currentComponent=editNode.liveObject,
            editContext=currentComponent.editContext,
            tree=editContext.getEditNodeTree()
        ;
        var rootNode=editContext.getRootEditNode(),
            children=tree.getChildren(rootNode),
            vmNodes=[]
        ;
        for(var i=0;i<children.length;i++){
            var child=children[i];
            if(isc.isA.ValuesManager(child.liveObject)){
                vmNodes.add(child);
            }
        }
        return vmNodes;
    }
,isc.A.createValuesManagerData=function isc_ValuesManagerChooserItem_createValuesManagerData(editNodes){
        var editor=this.creator,
            editNode=editor.currentComponent,
            currentComponent=editNode.liveObject,
            dataSource=currentComponent.getDataSource&&currentComponent.getDataSource(),
            data=[]
        ;
        for(var i=0;i<editNodes.length;i++){
            var node=editNodes[i],
                vmDataSource=node.liveObject.getDataSource(),
                record={id:node.ID,name:node.ID}
            ;
            if(dataSource&&dataSource.ID!=vmDataSource.ID){
                record.enabled=false;
                record.dataSource=vmDataSource;
            }
            data.add(record);
        }
        return data;
    }
,isc.A.createNewValuesManagerName=function isc_ValuesManagerChooserItem_createNewValuesManagerName(){
        var component=this.getComponent(),
            baseName=component.ID+"VM",
            name=baseName,
            ds=this.getOptionDataSource(),
            data=ds.getCacheData()
        ;
        var index=1;
        while(window[name]!=null){
            name=baseName+index++;
        }
        return name;
    }
,isc.A.createValuesManager=function isc_ValuesManagerChooserItem_createValuesManager(){
        var defaultName=this.createNewValuesManagerName();
        var editorWindow=this.makeEditor(defaultName);
        editorWindow.show();
    }
,isc.A.leaveValuesManager=function isc_ValuesManagerChooserItem_leaveValuesManager(){
        this.delayCall("_leaveValuesManager",[]);
    }
,isc.A._leaveValuesManager=function isc_ValuesManagerChooserItem__leaveValuesManager(){
        this.storeValue(null);
        this.redraw();
    }
,isc.A.setComponentDataSource=function isc_ValuesManagerChooserItem_setComponentDataSource(ds){
        var editContext=this.getEditContext(),
            component=this.getComponent()
        ;
        if(component.liveObject.getDataSource()!=ds){
            var paletteNode=editContext.makeDSPaletteNode(ds.ID),
                editNode=editContext.makeEditNode(paletteNode)
            ;
            editContext.addNode(editNode,component,0);
        }
        this.refreshValuesManagerChoices();
    }
,isc.A.addValuesManagerToChoices=function isc_ValuesManagerChooserItem_addValuesManagerToChoices(name){
        var ds=this.getOptionDataSource();
        ds.updateCaches({
            operationType:"add",
            data:{id:name,name:name}
        })
    }
,isc.A.refreshValuesManagerChoices=function isc_ValuesManagerChooserItem_refreshValuesManagerChoices(){
        var ds=this.getOptionDataSource(),
            data=ds.getCacheData()
        ;
        this._vmData=this.createValuesManagerData(this.getExistingValuesManagerNodes());
        ds.setCacheData(this._vmData);
    }
,isc.A.makeEditor=function isc_ValuesManagerChooserItem_makeEditor(defaultName){
        if(!this.mainLayout){
            this.mainLayout=this.createAutoChild("mainLayout");
            var fields=[
                {name:"name",type:"text",title:"Values Manager ID",required:true}
            ]
            this.addAutoChild("nameForm",{fields:fields});
            this.addAutoChild("buttonLayout");
            this.addAutoChild("cancelButton");
            this.addAutoChild("saveButton");
            this.editorWindow=this.createAutoChild("editorWindow",{
                items:[this.mainLayout]
            });
        }
        this.nameForm.setValues({name:defaultName});
        return this.editorWindow;
    }
,isc.A.closeWindow=function isc_ValuesManagerChooserItem_closeWindow(cancel){
        if(!cancel){
            var name=this.nameForm.getValue("name");
            var editContext=this.getEditContext(),
                rootNode=editContext.getRootEditNode(),
                component=this.getComponent(),
                type="ValuesManager",
                paletteNode=editContext.findPaletteNode("type",type)||
                              editContext.findPaletteNode("className",type)||
                              {type:type}
            ;
            paletteNode=isc.addProperties({},paletteNode,{defaults:{autoID:name}});
            if(component.liveObject&&component.liveObject.dataSource){
                var ds=component.liveObject.dataSource;
                if(!isc.isA.String(ds))ds=ds.ID;
                paletteNode.defaults.dataSource=ds;
            }
            var editNode=editContext.makeEditNode(paletteNode);
            editContext.addNode(editNode,rootNode);
            this.addValuesManagerToChoices(name);
            this.storeValue(name);
            this.redraw();
        }
        this.editorWindow.clear();
    }
);
isc.B._maxIndex=isc.C+19;

isc.defineClass("ScreenPickerItem","SelectItem");
isc.A=isc.ScreenPickerItem.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.B.push(isc.A.init=function isc_ScreenPickerItem_init(){
        if(!this.creator&&!this.creator.builder){
            this.logWarn("VB is not found");
        }else{
            this.valueMap=this.createValueMap();
        }
        this.Super("init",arguments);
    }
,isc.A.createValueMap=function isc_ScreenPickerItem_createValueMap(){
        var builder=this.creator.builder,
            currentScreenTitle=builder.getCurrentScreenTitle(),
            valueMap=builder.getProjectScreenNames()
        ;
        valueMap.remove(currentScreenTitle);
        return valueMap;
    }
);
isc.B._maxIndex=isc.C+2;

isc.defineClass("FieldValidatorsItem","TextItem");
isc.A=isc.FieldValidatorsItem.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.width="*";
isc.A.wrap=false;
isc.A.clipValue=true;
isc.A.height=22;
isc.A.multiple=true;
isc.A.cancelButtonTitle="Cancel";
isc.A.saveButtonTitle="Save";
isc.A.rightInlineIconsPadding=0;
isc.A.icons=[{
        imgOnly:true,
        src:{
        _base:isc.Canvas._blankImgURL,
            Over:"[SKINIMG]actions/edit.png",
            Focused:"[SKINIMG]actions/edit.png"
        },
        showOver:true,
        showOverWhen:"textBox",
        showFocused:true,
        inline:true,
        inlineIconAlign:"right",
        hspace:0,
        height:18,width:18,
        prompt:"Edit validators",
        click:"item.editFieldValidators()"
    }];
isc.A.validatorsWindowDefaults={
        _constructor:isc.Window,
        ID:"fieldValidatorsWindow",
        autoCenter:true,
        height:550,
        width:800,
        canDragResize:true,
        isModal:true,
        showModalMask:true,
        showHeaderIcon:false,
        showMinimizeButton:false,
        keepInParentRect:true,
        headerIconProperties:{padding:1,
            src:"[SKINIMG]actions/edit.png"
        },
        close:function(){
            this.Super("close",arguments);
            this.markForDestroy();
        },
        destroy:function(){
            if(this.dataSource)this.dataSource.destroy();
            this.Super("destroy",arguments);
        }
    };
isc.A.validatorsLayoutDefaults={
        _constructor:isc.ValidatorsEditor,
        addAsChild:true,
        width:"100%",
        height:"100%"
    };
isc.A.buttonLayoutDefaults={
        _constructor:"HLayout",
        width:"100%",
        height:20,
        layoutMargin:10,
        membersMargin:10,
        align:"right"
    };
isc.A.cancelButtonDefaults={
        _constructor:"IButton",
        click:function(){
            this.topElement.markForDestroy();
        }
    };
isc.A.saveButtonDefaults={
        _constructor:"IButton",
        click:function(){
            this.parentElement.saveValidators();
        }
    };
isc.B.push(isc.A._getDisplayValue=function isc_FieldValidatorsItem__getDisplayValue(value,canUseCurrentValue){
        var validators=this._getFilteredValidators(value);
        return(validators?validators.getProperty("type"):"");
    }
,isc.A.getElementHTML=function isc_FieldValidatorsItem_getElementHTML(value,dataValue){
        dataValue=(isc.isAn.Array(value)&&value.length>0?value[0]:null);
        return this.Super("getElementHTML",[value,dataValue]);
    }
,isc.A._getFilteredValidators=function isc_FieldValidatorsItem__getFilteredValidators(validators,dontDuplicate){
        if(!validators)return null;
        if(validators.find("_generated",true)||
            validators.find("_basic",true)||
            validators.find("_dsValidator",true))
        {
            var filteredValidators=[];
            for(var i=0;i<validators.length;i++){
                var validator=validators[i];
                if(!validator._generated&&!validator._basic&&!validator._dsValidator){
                    filteredValidators.add(isc.addProperties({},validator));
                }
            }
            validators=filteredValidators;
        }else if(!dontDuplicate){
            validators=isc.clone(validators);
        }
        return validators;
    }
,isc.A.editFieldValidators=function isc_FieldValidatorsItem_editFieldValidators(){
        var form=this.form,
            field=(form&&form.currentComponent&&form.currentComponent.liveObject),
            validators=field&&field.validators
        ;
        if(validators){
            validators=this._getFilteredValidators(validators);
        }
        var ds=isc.DataSource.create({
            addGlobalId:false,
            clientOnly:true,
            fields:[
                {name:field.name,type:field.getType()}
            ]
        });
        var validatorsWindowProperties={
            title:"Validators for "+field.name,
            dataSource:ds
        }
        var window=this.createAutoChild("validatorsWindow",validatorsWindowProperties);
        var validatorsLayoutProperties={
            fieldName:field.name,
            dataSource:ds,
            validators:validators
        };
        this.validatorsLayout=this.createAutoChild("validatorsLayout",validatorsLayoutProperties);
        var buttonLayoutProperties={
            window:window,
            editor:this.validatorsLayout,
            saveValidators:function(){
                if(this.editor.validate()){
                    var validators=this.editor.getValidators();
                    this.creator.storeValue(validators);
                    this.window.markForDestroy();
                }
            }
        };
        this.buttonLayout=this.createAutoChild("buttonLayout",buttonLayoutProperties);
        this.buttonLayout.addMembers([
            this.createAutoChild("cancelButton",{title:this.cancelButtonTitle}),
            this.createAutoChild("saveButton",{title:this.saveButtonTitle})
        ]);
        window.addItem(this.validatorsLayout);
        window.addItem(this.buttonLayout);
        window.show();
    }
);
isc.B._maxIndex=isc.C+4;

isc.defineClass("ClickStreamViewer","VLayout");
isc.A=isc.ClickStreamViewer.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.defaultWidth=450;
isc.A.defaultHeight=200;
isc.A.eventGridDefaults={
        _constructor:"ListGrid",
        sortField:"eventTime",
        sortDirection:"descending",
        selectionType:"single",
        hoverAutoFitMaxWidth:"80%",
        showClippedValuesOnHover:true,
        datetimeFormatter:"toSerializeableDate",
        canShowFilterEditor:true,
        defaultFields:[{
            name:"eventType",title:"Event Type",width:100
        },{
            name:"keyName",title:"Key Name(s)",hidden:true,width:100,
            formatCellValue:function(value,record,rowNum,colNum,grid){
                return record.keyNames||record.keyName;
            }
        },{
            name:"count",title:"Count",type:"integer",hidden:true,width:60
        },{
            name:"targetID",title:"Target Canvas",
            formatCellValue:function(value,record,rowNum,colNum,grid){
                return value?"["+record.targetClass+" ID: "+value+"]":"-";
            }
        },{
            name:"locator",title:"SmartClient Locator"
        },{
            name:"fileName",title:"File Name",hidden:true
        },{
            name:"fileVersion",title:"File Version",type:"datetime",width:160,
            hidden:true,align:"left"
        },{
            name:"fileType",title:"File Type",hidden:true,width:100
        },{
            name:"URL",hidden:true
        },{
            name:"eventTime",title:"Event Time",hidden:true,width:160,
            formatCellValue:function(value,record,rowNum,colNum,grid){
                return new Date(value).toNormalDate();
            }
        },{
            name:"_timeOffset",title:"Time Offset",width:150,
            formatCellValue:function(value,record,rowNum,colNum,grid){
                return isc.ClickStreamViewer.formatTimeOffset(value);
            }
        },{
            name:"errorTrace",title:"Error Trace",
            showValueIconOnly:true,showHover:true,hidden:true,
            hoverHTML:function(record){
                var errorTrace=record.errorTrace;
                return errorTrace?"<span style='white-space: pre'>"+errorTrace+"</span>":
                                    null;
            }
        }],
        _$errorIcon:"[SKIN]../../../../system/reference/skin/images/DocPrefsDialog/cancel.png",
        contentWindowConstructor:"ContentViewerWindow",
        contentWindowDefaults:{
            title:"Error Trace"
        },
        getValueIcon:function(field,value,record){
            return field.name=="errorTrace"&&value?this._$errorIcon:null;
        },
        canonicalizeStreamData:function(clickStreamData){
            if(clickStreamData==null)return;
            var startTime=clickStreamData.startTime.getTime(),
                lastErrorOffset=clickStreamData.lastErrorOffset,
                timeOffset,events=clickStreamData.events;
            for(var i=0,lastOffset=lastErrorOffset||0;i<events.length;
                 i++,lastOffset=timeOffset)
            {
                timeOffset=events[i].timeOffset;
                events[i].eventTime=timeOffset+startTime;
                events[i]._timeOffset=timeOffset-lastOffset;
            }
        },
        showLoadingDataMessage:function(){
            if(this._emptyMessage)return;
            this._emptyMessage=this.emptyMessage;
            this.emptyMessage=this.loadingDataMessage;
            this.setData([]);
        },
        setDataFromClickStream:function(clickStreamData){
            if(this._emptyMessage){
                this.emptyMessage=this._emptyMessage;
                delete this._emptyMessage;
            }
            this.canonicalizeStreamData(clickStreamData);
            this.setData(clickStreamData?clickStreamData.events.duplicate():[]);
        },
        selectionChanged:function(record){
            var debugTarget=window.debugTarget;
            if(!this.anySelected()||!this.creator.crossWindow||!debugTarget){
                return;
            }
            if(record&&record.targetID){
                debugTarget.call("isc.Log.hiliteCanvas",[record.targetID,true]);
            }
        },
        recordClick:function(viewer,record,recordNum,field){
            if(field.name!="errorTrace")return;
            if(!this.contentWindow)this.addAutoChild("contentWindow");
            this.contentWindow.showContent(record.errorTrace);
        }
    };
isc.A.streamPickerDefaults={
        _constructor:"DynamicForm",
        colWidths:[125,"*",70,5,110],numCols:5,
        updateStreamData:function(dropOrphanedData){
            var debugTarget=window.debugTarget;
            if(!debugTarget){
                this.logInfo("no cross-window DMI; skipping updating stream summaries",
                             "clickStreamViewer");
                return;
            }
            var form=this,
                viewer=form.creator;
            debugTarget.call("isc.ClickStream.getStreamValueMap",[],function(valueMap){
                var startTime=form.getValue("startTime");
                form.setValueMap("startTime",valueMap);
                form.markForRedraw("new stream state");
                if(!startTime&&!dropOrphanedData&&viewer.clickStream!=null){
                    return;
                }
                if(!startTime){
                    var select=form.getItem("startTime");
                    select.setUpPickList();
                    var first=select.pickList.getRecord(0);
                    startTime=first?first.startTime:null;
                    select.setValue(startTime);
                }
                if(!startTime||valueMap[startTime]){
                    viewer.loadClickStream(startTime);
                }
            });
        },
        initWidget:function(){
            this.Super("initWidget",arguments);
            this.updateStreamData();
        },
        items:[{
            name:"startTime",title:"Available ClickStreams",
            editorType:"SelectItem",type:"datetime",
            width:"100%",wrapTitle:false,
            sortField:"startTime",
            valueField:"startTime",
            displayField:"summary",
            addUnknownValues:false,
            pickListProperties:{},
            emptyDisplayValue:
                "<span style='text-align:center'>(no active stream selected)</span>",
            dateFormatter:"toLocaleString",
            pickListFields:[{
                name:"summary",type:"text",align:"left",width:"100%"
            }],
            init:function(){
                this.Super("init",arguments);
                this.makePickList();
            },
            changed:function(form){
                var record=this.getSelectedRecord();
                form.creator.loadClickStream(record.startTime);
            }
        },{
            name:"refresh",showTitle:false,
            icon:"[SKINIMG]/headerIcons/refresh.png",
            editorType:"ButtonItem",
            startRow:false,endRow:false,
            click:function(form,item){
                form.updateStreamData(true);
            }
        },{
            _$captureKey:"clickStream_capture",
            _$getCapture:"isc.ClickStream.getCommonStreamCapture",
            _$setCapture:"isc.ClickStream.setCommonStreamCapture",
            name:"capture",title:"Capture Events",
            editorType:"CheckboxItem",disabled:true,width:110,
            prompt:"Click to toggle capturing by the built-in ClickStream",
            init:function(){
                this.Super("init",arguments);
                var debugTarget=window.debugTarget,
                    capturing=isc.LogViewer.getGlobalLogCookieValue(this._$captureKey);
                if(isc.isA.Boolean(capturing)){
                    if(debugTarget)debugTarget.call(this._$setCapture,[capturing]);
                    this.setValue(capturing);
                    this.setDisabled(false);
                    return;
                }
                if(debugTarget){
                    var item=this;
                    debugTarget.call(this._$getCapture,[],function(capturing){
                        item.setValue(capturing);
                        item.setDisabled(false);
                    });
                }
            },
            changed:function(form,item,value){
                var debugTarget=window.debugTarget;
                if(debugTarget)debugTarget.call(this._$setCapture,[value]);
                isc.LogViewer.setGlobalLogCookieValue(this._$captureKey,value);
            }
        }]
    };
isc.B.push(isc.A.initWidget=function isc_ClickStreamViewer_initWidget(){
        this.Super("initWidget",arguments);
        if(this.showStreamPicker&&!this.crossWindow){
            this.logWarn("stream picker requires cross-window communications",
                         "clickStreamViewer");
            this.showStreamPicker=false;
        }
        if(this.showStreamPicker==null){
            this.showStreamPicker=!this.clickStream&&!!this.crossWindow;
        }
        this.addAutoChild("streamPicker",{
            viewer:this
        });
        this.addAutoChild("eventGrid",{
            viewer:this
        });
        if(this.clickStream)this.setClickStream(this.clickStream);
    }
,isc.A.updateStreamData=function isc_ClickStreamViewer_updateStreamData(){
        if(this.streamPicker)this.streamPicker.updateStreamData();
    }
,isc.A.setClickStream=function isc_ClickStreamViewer_setClickStream(clickStreamData){
        if(this.streamPicker)this.streamPicker.setValue("startTime",null);
        this._setClickStream(clickStreamData);
    }
,isc.A._setClickStream=function isc_ClickStreamViewer__setClickStream(clickStreamData){
        this.clickStream=clickStreamData;
        this.eventGrid.setDataFromClickStream(clickStreamData);
    }
,isc.A.loadClickStream=function isc_ClickStreamViewer_loadClickStream(startTime){
        if(startTime==null)this._setClickStream();
        var debugTarget=window.debugTarget;
        if(!this.crossWindow||!debugTarget){
            this.logWarn("loading clickStreamData by date requires cross-window DMI",
                         "clickStreamViewer");
            return;
        }
        var passedTime=startTime;
        if(!isc.isA.Date(startTime)){
            if(startTime==parseInt(startTime)){
                startTime=new Date(parseInt(startTime));
            }else if(isc.isA.String(startTime)){
                startTime=isc.DateUtil.parseSchemaDate(startTime);
            }
        }
        if(!isc.isA.Date(startTime)||!isFinite(startTime)){
            this.logWarn("can't load clickStreamDate - invalid date '"+passedTime+"'",
                         "clickStreamViewer");
            return;
        }
        this.eventGrid.showLoadingDataMessage();
        var viewer=this;
        debugTarget.call("isc.ClickStream.getClickStreamData",[startTime],function(csData){
            if(this.streamPicker&&this.streamPicker.getValue("startTime")==null){
                this.logInfo("setClickStreamData() called; dropping cross-window data");
                return;
            }
            viewer._setClickStream(csData);
        });
    }
);
isc.B._maxIndex=isc.C+5;

isc.A=isc.ClickStreamViewer;
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.B.push(isc.A.formatTimeOffset=function isc_c_ClickStreamViewer_formatTimeOffset(offset){
        if(offset<60000){
            var seconds=Math.floor(offset/1000),
                millis=offset%1000;
            return seconds+(seconds!=1?" seconds, ":" second, ")+
                millis+" millis";
        }
        var minutes=Math.floor(offset/60000),
            seconds=Math.floor((offset%60000)/1000);
        return minutes+"m, "+seconds+"s";
    }
);
isc.B._maxIndex=isc.C+1;

isc.defineClass("DataSourceNavigatorDS","DataSource");
isc.A=isc.DataSourceNavigatorDS.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.clientOnly=true;
isc.A.dataProtocol="clientCustom";
isc.A.fields=[
        {name:"datasourceId",title:"ID",primaryKey:true},
        {name:"status",title:"Status",valueMap:["loaded","registered"],hidden:true},
        {name:"dataFormat",title:"Data Format",hidden:true},
        {name:"serverType",title:"Server Type",hidden:true},
        {name:"usesSCServerProtocol",title:"SC Protocol",type:"boolean",hidden:true},
        {name:"hasRestConstructor",title:"REST",type:"boolean",hidden:true},
        {
            name:"type",title:"Type",
            valueMap:{
                "sql":"SQLDataSource",
                "hibernate":"HibernateDataSource",
                "jpa":"JPA DataSource (2.0)",
                "jpa1":"JPA DataSource (1.0)",
                "json":"JSON DataSource",
                "rest":"REST DataSource",
                "wsdl":"WSDL DataSource",
                "xml":"XML DataSource",
                "dmi":"DMI DataSource",
                "client":"Client Only",
                "generic":"Custom Server DataSource"
            }
        }
    ];
isc.A.localDataCacheStatus=null;
isc.A.remoteDataCacheStatus=null;
isc.B.push(isc.A.inferTypeValue=function isc_DataSourceNavigatorDS_inferTypeValue(record){
        if(record.status==="registered"||!record.usesSCServerProtocol){
            if(record.clientOnly)record.type="client";
            if(record.hasRestConstructor)record.type="rest";
            if(record.serviceNamespace)record.type="wsdl";
            if(record.recordXPath
                &&!record.dataFormat)record.type="xml";
            if(record.type&&record.superClass){
                var valueMap=this.getField("type").valueMap;
                var display=valueMap[record.type]||record.type;
                record.type=record.superClass+" ("+display+")";
            }
            var result=record.type||record.serverType||record.dataFormat||"generic";
            record.type=result;
        }else{
          record.type=record.serverType;
        }
    }
,isc.A.initCacheData=function isc_DataSourceNavigatorDS_initCacheData(callback,fetchRemote){
        var that=this;
        var localDataArrivedCommand={
            execute:function(data,status){
                for(var i=0;i<data.length;i++){
                    var ds=data[i];
                    if(!ds){
                        continue;
                    }
                    var dataFormat=ds.dataFormat;
                    var hasDataUrl=ds.dataURL!=null;
                    var bindings=ds.operationBindings||[];
                    for(var j=0;j<bindings.length;j++){
                        var binding=bindings[j];
                        if(!dataFormat&&binding.dataFormat){
                            dataFormat=binding.dataFormat;
                        }
                        if(binding.dataURL){
                            hasDataUrl=true;
                        }
                    }
                    var superClass=null;
                    if(ds.getSuperClass
                        &&ds.getSuperClass().isA("DataSource")
                        &&ds.getClassName()!="RestDataSource"){
                        superClass=ds.getClassName();
                    }
                    if(!ds.serverType&&!ds.clientOnly&&!hasDataUrl){
                        continue;
                    }
                    var record={
                        datasourceId:ds.ID,
                        status:"registered",
                        serverType:ds.serverType,
                        dataFormat:dataFormat,
                        usesSCServerProtocol:ds.serverType==="iscServer",
                        hasRestConstructor:isc.isA.RestDataSource(ds),
                        clientOnly:ds.clientOnly,
                        superClass:superClass
                    };
                    that.inferTypeValue(record);
                    var cache=that.getCacheData();
                    if(!cache){
                        cache=[];
                        that.setCacheData(cache);
                    }
                    var existing=cache.find("datasourceId",record.datasourceId);
                    if(existing){
                        cache.remove(existing);
                    }
                    cache.add(record);
                };
                that.localDataCacheStatus=status;
            }
        };
        var remoteDataArrivedCommand={
            execute:function(data,status){
                for(var i=0;i<data.length;i++){
                    var obj=data[i];
                    var record={
                        datasourceId:obj.dsName,
                        status:"loaded",
                        serverType:obj.dsType,
                        dataFormat:obj.dataFormat||"iscServer",
                        usesSCServerProtocol:obj.usesSCServerProtocol,
                        hasRestConstructor:obj.serverConstructor==="RestDataSource",
                        clientOnly:false
                    };
                    that.inferTypeValue(record);
                    var cache=that.getCacheData();
                    if(!cache){
                        cache=[];
                        that.setCacheData(cache);
                    }
                    var existing=cache.find("datasourceId",record.datasourceId);
                    if(!existing){
                        cache.add(record);
                    }
                };
                that.remoteDataCacheStatus=status;
            }
        };
        var observables=[
            {object:localDataArrivedCommand,method:"execute"}
        ];
        if(fetchRemote){
            observables.add(
                {object:remoteDataArrivedCommand,method:"execute"}
            );
        }
        isc.Page.waitForMultiple(observables,function(){
            callback.execute();
        });
        if(!window.debugTarget){
            var retVal=isc.DataSource.getRegisteredDataSourceObjects(true,true);
            localDataArrivedCommand.execute(retVal,isc.RPCResponse.STATUS_SUCCESS);
        }else{
            window.debugTarget.call("isc.DataSource.getRegisteredDataSourceObjects",
                                    [true,true],
                function(retVal){
                    localDataArrivedCommand.execute(retVal,isc.RPCResponse.STATUS_SUCCESS);
                }
            );
        }
        if(fetchRemote){
            isc.DMI.call({
                appID:"isc_builtin",
                className:"com.isomorphic.tools.BuiltinRPC",
                methodName:"getDefinedDataSources",
                requestParams:{willHandleError:true,showPrompt:true},
                callback:function(rpcResponse,rawData,rpcRequest){
                    var status=rpcResponse.status;
                    if(status===-1){
                        isc.logWarn("Unable to obtain datasource listing from server: "+rawData);
                        remoteDataArrivedCommand.execute([],status);
                    }else{
                        remoteDataArrivedCommand.execute(rawData,status);
                    }
                }
            });
        }
    }
,isc.A.transformRequest=function isc_DataSourceNavigatorDS_transformRequest(dsRequest){
        var that=this;
        var onCacheInit={
            execute:function(){
                that.prepareResponse(dsRequest.unconvertedDSRequest||dsRequest);
            }
        };
        var criteria=dsRequest.data,
            fetchRemote=criteria&&criteria.status&&criteria.status!='registered';
        if(this.getCacheData()&&!this.getCacheData().isEmpty()){
            onCacheInit.execute();
        }else{
            isc.Page.waitFor(onCacheInit,"execute");
            this.initCacheData(onCacheInit,fetchRemote);
        }
    }
,isc.A.prepareResponse=function isc_DataSourceNavigatorDS_prepareResponse(dsRequest){
        var criteria=dsRequest.data,
            response={};
        response.data=this.applyFilter(this.getCacheData(),criteria,dsRequest);
        this.processResponse(dsRequest.requestId,response);
    }
);
isc.B._maxIndex=isc.C+4;

isc.defineClass("DataSourceNavigator","Canvas");
isc.A=isc.DataSourceNavigator.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.mode="devConsole";
isc.A.enumerationDataSourceName="isc_datasources";
isc.A.exportReifyUnloadedDSMessage="Some DataSources or couldn't be loaded";
isc.A.exportReifyNoRecordsDSMessage="Fetching failed for some DataSources";
isc.A.dashboardDataSourceName="isc_dashboards";
isc.A.dsNavigatorWindowConstructor=isc.Window;
isc.A.dsNavigatorWindowDefaults={
        showMinimizeButton:false,
        visibility:"hidden",
        title:""
    };
isc.A.dsNavigatorStackConstructor="DSNavigatorStack";
isc.A.dsEnumerationSectionTitle="DataSource List";
isc.A.dsEnumerationSectionItems=[
        "autoChild:dsEnumerationFilter",
        "autoChild:dsEnumerationGrid"
    ];
isc.A.dsDashboardSectionTitle="Dashboards";
isc.A.dsDashboardSectionItems=[
        "autoChild:dsDashboard"
    ];
isc.A.dsEnumerationFilterConstructor="DynamicForm";
isc.A.dsEnumerationFilterDefaults={
        colWidths:[100,"*"],
        fields:[
            {
                name:"radioGroup",title:"Show",type:"radioGroup",vertical:false,
                valueMap:{
                    "registered":"DataSources in current application",
                    "":"All DataSources"
                },
                changed:function(form,item,value){
                    var that=form.creator,
                        grid=that.dsEnumerationGrid,
                        ds=isc.DS.get(that.enumerationDataSourceName);
                    if(value!="registered"
                        &&ds.remoteDataCacheStatus!=isc.RPCResponse.STATUS_SUCCESS){
                            that.invalidateCache();
                    }
                    var criteria={
                        status:value
                    };
                    grid.fetchData(criteria);
                }
            }
        ],
        values:{radioGroup:"registered"}
    };
isc.A.dsEnumerationGridConstructor="DSEnumerationGrid";
isc.A.dsDashboardConstructor="DSDashboard";
isc.A.dsDashboardDefaults={
        paletteDataSourceNameField:"datasourceId",
        dashboardsProperties:{
            autoFitData:"vertical",
            autoFitMaxRecords:4
        },
        paletteProperties:{
            sortFieldNum:0,
            paletteNodeProperties:{
                deferCreation:true
            },
            init:function(){
                var dashboard=this.creator,
                    nav=dashboard.creator;
                this.paletteNodeProperties=isc.addProperties({},this.paletteNodeProperties,{
                    loadData:function(paletteNode,callback){
                        var dsName=this.defaults.dataSource;
                        nav.useDataSourceObject(dsName,function(ds){
                            paletteNode.isLoaded=true;
                            callback();
                        });
                    }
                });
                this.Super("init",arguments);
            }
        },
        initWidget:function(){
            this.Super("initWidget",arguments);
            var undef;
            this.palette.setDefaultEditContext(undef);
            this.editPane.setDefaultPalette(undef);
            var stack=this.creator.dsNavigatorStack;
            stack.observe(this.editButton,"click","observer.relocateDashboard()");
            stack.observe(this.viewButton,"click","observer.relocateDashboard()");
        }
    };
isc.A.dsContentSectionTitle="DataSource: ${dsId}";
isc.A.dsContentAuditedSectionTitle="Audit trail for DataSource ${dsId}";
isc.A.dsContentRecordAuditSectionTitle="Audit trail for record ${pkCrit} from DataSource ${dsId}";
isc.A.dsContentListGridConstructor="DSContentGrid";
isc.A.dsContentAuditListGridConstructor="DSContentGrid";
isc.A.dsContentAuditListGridDefaults={
        canEdit:false,
        canRemoveRecords:false,
        sortField:"audit_revision",
        sortDirection:"descending"
    };
isc.A.dsContentToolStripConstructor="DSContentToolStrip";
isc.A.dataSourceNavigatorDSConstructor="DataSourceNavigatorDS";
isc.B.push(isc.A.removeSection=function isc_DataSourceNavigator_removeSection(name){
        this.dsNavigatorStack.removeSection(name);
    }
,isc.A.invalidateCache=function isc_DataSourceNavigator_invalidateCache(){
        var grid=this.dsEnumerationGrid,
            ds=grid.getDataSource(),
            dash=this.dsDashboard
        ;
        var item,form=this.dsEnumerationFilter;
        if(form)item=form.getField("radioGroup");
        var cb={
            execute:function(){
                if(item&&item.getValue()!="registered"&&
                    ds.remoteDataCacheStatus!=isc.RPCResponse.STATUS_SUCCESS)
                {
                        item.setValue("registered");
                        isc.warn(
                            "To work with DataSources other than those currently "+
                            "registered by this page, please enable the getDefinedDataSources "+
                            "RPC DMI BuiltIn as described in the 'Tools Deployment' "+
                            "documentation topic.");
                        return;
                }
                grid.invalidateCache();
                if(dash){
                    dash.palette.initCacheData();
                }
            }
        };
        ds.initCacheData(cb,form?form.values["radioGroup"]!="registered":false);
    }
,isc.A.fetchAllDataSources=function isc_DataSourceNavigator_fetchAllDataSources(){
        var form=this.dsEnumerationFilter;
        if(form)form.setValue("radioGroup","");
        var grid=this.dsEnumerationGrid,
            ds=grid.getDataSource(),
            dash=this.dsDashboard
        ;
        ds.initCacheData({
            execute:function(){
                grid.fetchData({status:""});
                if(dash){
                    dash.palette.initCacheData();
                }
            }
        },true);
    }
,isc.A.initWidget=function isc_DataSourceNavigator_initWidget(){
        var eds=isc.DS.get(this.enumerationDataSourceName);
        if(!eds){
            eds=this.createAutoChild("dataSourceNavigatorDS",{
                ID:this.enumerationDataSourceName
            });
        }
        var typeField=eds.getField("type");
        typeField.hidden=this.showDSType==false;
        var dds=isc.DS.get(this.dashboardDataSourceName);
        if(!dds){
            isc.LocalDataSource.create({
                ID:this.dashboardDataSourceName,
                fields:[
                    {name:'id',type:"sequence",primaryKey:"true"},
                    {name:'description',type:"text"},
                    {name:'layout',type:"text"}
                ]
            });
        }
        this.dsEnumerationGridProperties={
            dataSource:this.enumerationDataSourceName
        };
        if(!isc.hasOptionalModules("SCServer")){
            this.showDsEnumerationFilter=false;
        }
        if(this.mode=="adminConsole"){
            isc.addProperties(this.dsEnumerationGridProperties,{
                autoFetchData:false
            });
            this.showDsEnumerationFilter=false;
        }
        this.dsDashboardProperties={
            dataSource:this.dashboardDataSourceName,
            paletteDataSource:this.enumerationDataSourceName
        };
        this.Super("initWidget",arguments);
        var window=this.addAutoChild("dsNavigatorWindow");
        var stack=this.addAutoChild("dsNavigatorStack",{
            sections:[{
                title:this.dsEnumerationSectionTitle,
                items:this.dsEnumerationSectionItems,
                expanded:true
            },{
                title:this.dsDashboardSectionTitle,
                items:this.dsDashboardSectionItems
            }]
        });
        if(this.mode=="adminConsole")this.fetchAllDataSources();
    }
,isc.A.loadDataSourceFirst=function isc_DataSourceNavigator_loadDataSourceFirst(id,func){
        if(isc.hasOptionalModules("SCServer")){
            isc.DataSource.loadWithParents(id,function(){
                func(isc.DataSource.getDataSource(id));
            });
        }else{
            this.logWarn("SC Server module not present; can't load DataSource '"+id+"'");
            func(null);
        }
    }
,isc.A.useDataSourceObject=function isc_DataSourceNavigator_useDataSourceObject(id,func){
        var ds=isc.DataSource.getDataSource(id);
        if(ds){
            func(ds);
        }else if(!window.debugTarget){
            this.loadDataSourceFirst(id,func);
        }else{
            var that=this;
            window.debugTarget.call("isc.DataSource.getDataSource",[id],
                function(retVal){
                    if(retVal){
                        var cl=isc.DataSource.create(retVal);
                        func(cl);
                    }else{
                        that.loadDataSourceFirst(id,func);
                    }
                }
            );
        }
    }
,isc.A.getShortDSId=function isc_DataSourceNavigator_getShortDSId(ds){
        return ds?ds.ID:null;
    }
,isc.A.getAuditDSInitialSort=function isc_DataSourceNavigator_getAuditDSInitialSort(auditedDS){
        if(auditedDS==null)return null;
        var bestSortName=auditedDS.getAuditRevisionFieldName(),
            fallbackName=auditedDS.getAuditTimeStampFieldName(),
            prop=bestSortName||fallbackName
        ;
        return prop?{property:prop,direction:"descending"}:null;
    }
);
isc.B._maxIndex=isc.C+8;

isc.A=isc.DataSourceNavigator;
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.B.push(isc.A.downloadClientContent=function isc_c_DataSourceNavigator_downloadClientContent(data,filename,mimeType){
        isc.DMI.callBuiltin({
            methodName:"downloadClientContent",
            arguments:[data,filename,mimeType],
            requestParams:{
                transport:"hiddenFrame",
                downloadResult:true,
                showPrompt:false
            }
        });
    }
);
isc.B._maxIndex=isc.C+1;

isc.defineClass("DSNavigatorStack","SectionStack");
isc.A=isc.DSNavigatorStack.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.width="100%";
isc.A.height="100%";
isc.A.overflow="auto";
isc.A.visibilityMode="multiple";
isc.A.refreshButtonConstructor=isc.ToolStripButton;
isc.A.refreshButtonDefaults={
        title:"Refresh",
        icon:"[SKINIMG]/actions/refresh.png",
        click:function(){
            var nav=this.creator.creator;
            nav.invalidateCache();
        }
    };
isc.A.exportReifyCSVConstructor=isc.ToolStripButton;
isc.A.exportReifyCSVDefaults={
        title:"Reify Export",
        selectingTitle:"Done Selecting",
        selectingMessage:"Select rows from the DataSource List for export.  When finished, click 'Done Selecting'.",
        click:function(){
            var dsNav=this.creator.creator,
                grid=dsNav.dsEnumerationGrid,
                stack=dsNav.dsNavigatorStack,
                selecting=dsNav._selectingExports;
            if(selecting){
                this.setTitle(this._oldTitle);
                delete this._oldTitle;
                grid.setSelectionType(this._oldSelectionType);
                delete this._oldSelectionType;
                isc.Notify.dismissMessage(this._selectingMessage);
                delete this._selectingMessage;
                grid.exportSelectionInReifyFormat();
                grid.deselectAllRecords();
            }else{
                this._oldTitle=this.title;
                this._oldSelectionType=grid.selectionType;
                this.setTitle(this.selectingTitle);
                this._selectingMessage=isc.Notify.addMessage(this.selectingMessage,null,
                                             null,{canDismiss:true,duration:0});
                grid.setSelectionType("simple");
            }
            dsNav._selectingExports=!selecting;
        }
    };
isc.A.closeButtonConstructor=isc.ImgButton;
isc.A.closeButtonDefaults={
        autoDraw:false,src:"[SKIN]actions/close.png",size:16,
        showFocused:false,showRollOver:false,showDown:false
    };
isc.A.auditButtonConstructor=isc.ToolStripButton;
isc.A.auditButtonDefaults={
        title:"Show Audit Trail"
    };
isc.B.push(isc.A._createSectionName=function isc_DSNavigatorStack__createSectionName(dataSource,keysObj,numericId){
        var name="_Section_";
        if(numericId!=null)name+=numericId+"_";
        name+=dataSource.ID;
        if(keysObj)for(var key in keysObj){
            name+="_"+keysObj[key];
        }
        return name;
    }
,isc.A.addDataSourceSection=function isc_DSNavigatorStack_addDataSourceSection(ds,auditedDS,keysObj,timeCrit){
        var name=this._createSectionName(ds,keysObj),
            nav=this.creator,
            audited=ds.audit,
            stack=this
        ;
        var initialCrit=keysObj&&timeCrit?isc.DS.combineCriteria(keysObj,timeCrit):
                          keysObj||timeCrit
        ;
        if(this.getSectionNumber(name)>=0){
            this.expandSection([name]);
            var sectionHeader=this.getSectionHeader(name),
                grid=sectionHeader.items[0];
            grid.invalidateCache();
            grid.setCriteria(initialCrit);
            return grid;
        }
        var shortDSId=nav.getShortDSId(ds),
            auditedId=nav.getShortDSId(auditedDS),
            title
        ;
        if(keysObj){
            var pkCrit=[];
            for(var key in keysObj){
                pkCrit.add(key+": "+keysObj[key]);
            }
            var pkField=auditedDS.getPrimaryKeyFieldName(),
                pkValue=keysObj[pkField]
            ;
            title=nav.dsContentRecordAuditSectionTitle.evalDynamicString(this,{
                dsId:auditedId,pkCrit:pkCrit,pkField:pkField,pkValue:pkValue
            });
        }else if(auditedDS){
            title=nav.dsContentAuditedSectionTitle.
                evalDynamicString(this,{dsId:auditedId});
        }else{
            title=nav.dsContentSectionTitle.evalDynamicString(this,{dsId:shortDSId});
        }
        var fields;
        if(keysObj){
            fields=[];
            for(var key in keysObj){
                fields.add({name:key,hidden:true,canHide:false});
            }
        }
        var gridAutoChildName=auditedDS?"dsContentAuditListGrid":"dsContentListGrid";
        var grid=nav.createAutoChild(gridAutoChildName,{
            dataSource:ds,
            fields:fields,
            initialCriteria:initialCrit,
            showHoverComponents:audited,canHover:audited,
            initialSort:nav.getAuditDSInitialSort(auditedDS)
        });
        if(auditedDS)grid.setHilites([{
            changedFieldsFieldName:auditedDS.getAuditChangedFieldsFieldName(),
            textColor:"red"
        }]);
        var strip=nav.createAutoChild("dsContentToolStrip",{
            dsContentListGrid:grid,
            showAddRecordButton:!auditedDS
        });
        var controls=[];
        if(audited){
            controls.add(this.createAutoChild("auditButton",{
                click:function(){
                    var dsName=ds.getAuditDataSourceID();
                    nav.useDataSourceObject(dsName,function(auditDS){
                        stack.addDataSourceSection(auditDS,ds);
                    },true);
                }
            }));
        }
        controls.add(this.createAutoChild("closeButton",{
            click:function(){
                stack.removeSection(name);
                stack.expandSection(0);
            }
        }));
        this.addSection({
            name:name,
            title:title,
            dataSource:ds,
            expanded:true,
            controls:controls,
            items:[grid,strip]
        },1);
        return grid;
    }
,isc.A.initWidget=function isc_DSNavigatorStack_initWidget(){
        this.Super("initWidget",arguments);
        var controls=[],nav=this.creator;
        if(nav.showDSListRefreshButton!=false){
            controls.add(this.createAutoChild("refreshButton"));
        }
        if(nav.showDSListExportReifyCSV!=false){
            controls.add(this.createAutoChild("exportReifyCSV"));
        }
        if(controls.length)this.sections[0].controls=controls;
    }
,isc.A.relocateDashboard=function isc_DSNavigatorStack_relocateDashboard(){
        var nav=this.creator,
            dash=nav.dsDashboard,
            stack=nav.dsNavigatorStack,
            window=nav.dsNavigatorWindow;
        var section=stack.sections[1];
        window.addItem(dash);
        window.maximize();
        window.show();
        var undo=function(){
            stack.addItem(section,dash,0);
            window.items=[];
            section.ignore(window,"close");
        };
        section.observe(window,"close",undo);
    }
);
isc.B._maxIndex=isc.C+4;

isc.defineClass("DSEnumerationGrid","ListGrid");
isc.A=isc.DSEnumerationGrid.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.sortField="datasourceId";
isc.A.showFilterEditor=true;
isc.A.autoFetchData=true;
isc.A.initialCriteria={
        status:"registered"
    };
isc.A.selectionType="none";
isc.B.push(isc.A._addDataSourceSection=function isc_DSEnumerationGrid__addDataSourceSection(dsName,auditDS){
        var grid=this,
            nav=this.creator,
            stack=nav.dsNavigatorStack
        ;
        nav.useDataSourceObject(dsName,function(ds){
            if(!ds){
                stack.logWarn("Unable to add section for DataSource '"+dsName+"'");
                return;
            }
            if(auditDS)return stack.addDataSourceSection(auditDS,ds);
            var auditedName=ds.auditedDataSourceID;
            if(!auditedName)return stack.addDataSourceSection(ds);
            grid._addDataSourceSection(auditedName,ds);
        },true);
    }
,isc.A.recordClick=function isc_DSEnumerationGrid_recordClick(viewer,record,recordNum,field,fieldNum,value,rawValue){
        if(this.creator._selectingExports)return;
        var dsName=record.datasourceId;
        viewer._addDataSourceSection(dsName);
    }
,isc.A.exportSelectionInReifyFormat=function isc_DSEnumerationGrid_exportSelectionInReifyFormat(){
        var dsNav=this.creator,
            dsNames=this.getSelection().getProperty("datasourceId");
        if(!dsNames.length)return;
        isc.Reify.loadAndSortDataSources(dsNames,
            function(sortedNames,dsMap,settings,incomplete){
            if(incomplete){
                isc.Notify.addMessage(dsNav.exportReifyUnloadedDSMessage,null,null,{
                    messagePriority:isc.Notify.WARN
                });
            }
            if(isc.isAn.emptyObject(dsMap))return;
            isc.MultiDSExportFetchWizard.create({
                dsNames:sortedNames,dsMap:dsMap,settings:settings,
                incompleteMessage:dsNav.exportReifyNoRecordsDSMessage
            }).show();
        },null,dsNav);
    }
);
isc.B._maxIndex=isc.C+3;

isc.defineClass("DSContentGrid","ListGrid");
isc.A=isc.DSContentGrid.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.canEdit=true;
isc.A.hoverWidth="100%";
isc.A.autoFetchData=true;
isc.A.showFilterEditor=true;
isc.A.canMultiSort=true;
isc.A.canRemoveRecords=true;
isc.A.canAddFormulaColumns=true;
isc.A.canAddSummaryColumns=true;
isc.A.useAllDataSourceFields=true;
isc.A.auditFieldDefaults={
        name:"_auditField",
        _isAuditField:true,
        type:"icon",width:24,
        title:"Record History",
        cellIcon:"[SKIN]/RichTextEditor/text_align_justified.png",
        showDefaultContextMenu:false,
        selectCellTextOnClick:false,
        canEdit:false,
        canHide:false,
        canSort:false,
        canGroupBy:false,
        canFilter:false,
        showTitle:false,
        canExport:false,
        autoFitWidth:false,
        canDragResize:false,
        canAutoFitWidth:false,
        ignoreKeyboardClicks:true,
        showGridSummary:false,
        showGroupSummary:false,
        summaryValue:"&nbsp;"
    };
isc.A.dsRecordAuditPreviewConstructor="DSRecordAuditPreview";
isc.B.push(isc.A.initWidget=function isc_DSContentGrid_initWidget(){
        if(this.hasAuditedDS())this.setupAuditField();
        this.Super("initWidget",arguments);
    }
,isc.A.destroy=function isc_DSContentGrid_destroy(){
        var preview=this.dsRecordAuditPreview;
        if(preview)preview.destroy();
    }
,isc.A.resized=function isc_DSContentGrid_resized(){
        var preview=this.dsRecordAuditPreview;
        if(preview)preview.destroy();
    }
,isc.A.hasAuditedDS=function isc_DSContentGrid_hasAuditedDS(){
        var dataSource=this.getDataSource();
        return dataSource&&dataSource.audit;
    }
,isc.A.setupAuditField=function isc_DSContentGrid_setupAuditField(){
        var fields=this.fields=[],
            ds=this.getDataSource(),
            fieldNames=ds.getFieldNames(true)
        ;
        for(var i=0;i<fieldNames.length;i++){
            fields.add({name:fieldNames[i]});
        }
        fields.add(isc.addProperties({},this.auditFieldDefaults,
                                     this.auditFieldProperties));
        var nav=this.creator,
            ds=this.dataSource,
            grid=this
        ;
        var auditDSId=ds.getAuditDataSourceID();
        nav.useDataSourceObject(auditDSId,function(auditDS){
            grid.detailDS=auditDS;
        },true);
    }
,isc.A.cellHover=function isc_DSContentGrid_cellHover(record,rowNum,colNum){
        var field=this.getField(colNum);
        return!!field._isAuditField;
    }
,isc.A.getCellHoverComponent=function isc_DSContentGrid_getCellHoverComponent(record,rowNum,colNum){
        if(!this.detailDS){
            this.logInfo("no hover available; audit DS has not yet been loaded");
            return;
        }
        var preview=this.dsRecordAuditPreview,
            criteria=this.dataSource.filterPrimaryKeyFields(record)
        ;
        if(preview&&!preview.destroying&&!preview.destroyed){
            preview.recordAuditGrid.setCriteria(criteria);
            return preview;
        }
        return this.dsRecordAuditPreview=this.createAutoChild("dsRecordAuditPreview",{
            criteria:criteria,
            auditDS:this.detailDS,
            dataSource:this.dataSource,
            hoverAutoDestroy:false
        });
    }
,isc.A.recordClick=function isc_DSContentGrid_recordClick(viewer,record,recordNum,field,fieldNum){
        if(field._isAuditField&&this.detailDS){
            var stack=this.creator.dsNavigatorStack,
                criteria=this.dataSource.filterPrimaryKeyFields(record)
            ;
            stack.addDataSourceSection(this.detailDS,this.dataSource,criteria);
            return false;
        }
    }
,isc.A.applyHilite=function isc_DSContentGrid_applyHilite(hilite,data,fieldName){
        if(!hilite||!hilite.changedFieldsFieldName){
            return this.invokeSuper(isc.DSContentGrid,hilite,data,fieldName);
        }
        hilite=this.getHilite(hilite);
        var changedFieldsFieldName=hilite.changedFieldsFieldName;
        for(var i=0;i<data.length;i++){
            var changedFields=data[i][changedFieldsFieldName];
            if(!changedFields)continue;
            for(var j=0;j<changedFields.length;j++){
                var field=this.getField(changedFields[j]);
                this.hiliteRecord(data[i],field,hilite);
            }
        }
    }
);
isc.B._maxIndex=isc.C+9;

isc.defineClass("DSContentToolStrip","ToolStrip");
isc.A=isc.DSContentToolStrip.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.neverExpandHeight=true;
isc.A.exportButtonConstructor=isc.ToolStripButton;
isc.A.exportButtonDefaults={
        autoDraw:false,
        title:"Export",
        icon:"[SKINIMG]/actions/save.png",
        click:function(){
            var toolStrip=this.creator,
                dsNav=toolStrip.creator,
                form=toolStrip.exportTypeForm,
                grid=toolStrip.dsContentListGrid,
                dataSource=grid.getDataSource()
            ;
            var exportAs=form.getValue("exportType"),
                filename=dsNav.getShortDSId(dataSource),
                identifier=form.getValue("csvPropIdentifier"),
                hasServer=isc.hasOptionalModules("SCServer")
            ;
            if(hasServer&&exportAs!="reify"){
                grid.exportClientData({
                    exportAs:exportAs,exportPropertyIdentifier:identifier,
                    exportFilename:filename
                });
                return;
            }
            var dsID=dataSource.getID();
            isc.Reify.loadAndSortDataSources([dsID],
                function(dsNames,dsMap,settings,incomplete){
                    if(isc.isAn.emptyObject(dsMap))return;
                    isc.MultiDSExportFetchWizard.create({
                        dsNames:dsNames,dsMap:dsMap,settings:settings,
                        incompleteMessage:dsNav.exportReifyNoRecordsDSMessage,
                        title:"Export Configuration for DataSource "+dsID,
                        exportFilename:filename+".reify.xml",
                        criteria:grid.getFilterEditorCriteria()
                    }).show();
                },null,dsNav);
        }
    };
isc.A.exportTypeFormConstructor="DynamicForm";
isc.A.exportTypeFormDefaults={
        numCols:4,
        fields:[
            {
                name:"exportType",type:"select",width:140,
                showTitle:false,
                redrawOnChange:true,
                valueMap:{
                    "csv":"CSV",
                    "xml":"XML",
                    "xls":"XLS (Excel97)",
                    "ooxml":"OOXML (Excel2007)",
                    "reify":"Reify DataSource upload format"
                },
                defaultValue:isc.hasOptionalModules("SCServer")?"csv":"reify"
            },{
                name:"csvPropIdentifier",type:"radioGroup",
                vertical:false,wrap:false,showTitle:false,
                showIf:"form.getValue('exportType') == 'csv'",
                valueMap:{
                    title:"Use field titles",
                    name:"Use field names"
                }
            }
        ],
        disabled:!isc.hasOptionalModules("SCServer")
    };
isc.A.refreshButtonConstructor=isc.ToolStripButton;
isc.A.refreshButtonDefaults={
        autoDraw:false,
        title:"Refresh",
        icon:"[SKINIMG]/actions/refresh.png",
        click:function(){
            var grid=this.creator.dsContentListGrid;
            grid.invalidateCache();
        }
    };
isc.A.addRecordButtonConstructor=isc.ToolStripButton;
isc.A.addRecordButtonDefaults={
        autoDraw:false,
        title:"Add Record",
        icon:"[SKINIMG]/actions/add.png",
        click:function(){
            var grid=this.creator.dsContentListGrid;
            grid.startEditingNew();
        }
    };
isc.B.push(isc.A.initWidget=function isc_DSContentToolStrip_initWidget(){
        this.Super("initWidget",arguments);
        this.addAutoChild("refreshButton");
        if(this.showAddRecordButton!=false){
            this.addMember("separator");
            this.addAutoChild("addRecordButton");
        }
        this.addMember("separator");
        this.addAutoChild("exportButton");
        this.addAutoChild("exportTypeForm");
    }
);
isc.B._maxIndex=isc.C+1;

isc.defineClass("DSRecordAuditPreview","VLayout");
isc.A=isc.DSRecordAuditPreview.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.border=1;
isc.A.overflow="visible";
isc.A.moveOccludingResize=true;
isc.A.recordAuditHeaderTitle="Recent changes for DataSource ${dsId}";
isc.A.recordAuditHeaderConstructor="Label";
isc.A.recordAuditHeaderDefaults={
        backgroundColor:"white",
        padding:5,height:1,overflow:"visible"
    };
isc.A.recordAuditGridConstructor="ListGrid";
isc.A.recordAuditGridDefaults={
        autoFetchData:true,
        autoFitMaxRecords:5,
        autoFitData:"vertical",
        bodyOverflow:"hidden",
        backgroundColor:"white",
        sortField:"audit_revision",
        sortDirection:"descending",
        emptyMessageHeight:44,height:1,
        dataProperties:{context:{showPrompt:false}},
        applyHilite:isc.DSContentGrid.getPrototype().applyHilite
    };
isc.A.recordAuditInfoTitle="Click to add audit information as a new section";
isc.A.recordAuditInfoConstructor="Label";
isc.A.recordAuditInfoDefaults={
        backgroundColor:"white",
        padding:5,height:1,overflow:"visible"
    };
isc.B.push(isc.A.initWidget=function isc_DSRecordAuditPreview_initWidget(){
        this.Super("initWidget",arguments);
        var ds=this.dataSource,
            masterGrid=this.creator,
            nav=masterGrid.creator
        ;
        this.setMembers([
            this.addAutoChild("recordAuditHeader",{
                contents:this.recordAuditHeaderTitle.evalDynamicString(this,{
                    dsId:nav.getShortDSId(ds)
                })
            }),
            this.addAutoChild("recordAuditGrid",{
                dataSource:this.auditDS,
                initialCriteria:this.criteria,
                initialSort:nav.getAuditDSInitialSort(ds),
                hilites:[{
                    changedFieldsFieldName:ds.getAuditChangedFieldsFieldName(),
                    textColor:"red"
                }]
            }),
            this.addAutoChild("recordAuditInfo",{
                contents:this.recordAuditInfoTitle
            })
        ]);
        this.recordAuditGrid.observe(masterGrid,"dataChanged","observer.invalidateCache()");
    }
);
isc.B._maxIndex=isc.C+1;

isc.defineClass("MultiDSExportFetchWizard","ModalWindow");
isc.A=isc.MultiDSExportFetchWizard.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.title="Multi-DataSource Export Configuration";
isc.A.globalExportConfigConstructor="DynamicForm";
isc.A.globalExportConfigDefaults={
        wrapItemTitles:false,padding:5,
        numCols:5,autoParent:"body",
        fields:[{
            type:"blurb",width:1,wrap:true,
            showIf:"!form.creator.isSingletonMode()",
            defaultValue:"Configure the global settings here to affect all DataSources "+
                          "being exported.  These may be overridden on a per-DS basis in "+
                          "the SectionStack below."
        },{
            name:"numRows",title:"Row Limit",type:"integer",width:150,
            defaultValue:isc.Reify._defaultMockDSExportSettings.numRows
        },{
            name:"numLevels",title:"Level Limit",type:"integer",width:150,
            defaultValue:isc.Reify._defaultMockDSExportSettings.numLevels
        },{
            name:"exportMode",type:"radioGroup",
            showTitle:false,wrap:false,vertical:false,colSpan:"*",
            valueMap:{show:"Show export as text to be copied",download:"Download export"},
            defaultValue:"download",showIf:"isc.hasOptionalModules('SCServer')"
        }],
        layoutChildren:function(){
            var newNumCols=this.getWidth()>=780?5:4;
            if(newNumCols!=this.numCols)this.setNumCols(newNumCols);
            this.Super("layoutChildren",arguments);
        }
    };
isc.A.perDSConfigStackConstructor="SectionStack";
isc.A.perDSConfigStackDefaults={
        visibilityMode:"multiple",
        overflow:"auto",
        minWidth:650,
        dsConfigSectionFormConstructor:"DynamicForm",
        dsConfigSectionFormDefaults:{
            topPadding:5,numCols:4,
            colWidths:[90,155,1,"*"],
            fields:[{
                name:"limitRows",title:"Limit Rows",type:"checkbox",
                colSpan:4,labelAsTitle:true,
                showIf:function(item,value,form){
                    return form.isDetailDS;
                },
                changed:function(form,item,value){
                    form.setLimitRows(value);
                },
                init:function(){
                    this.Super("init",arguments);
                    var form=this.form,
                        dsId=form.dataSource.ID;
                    this.setHint(form.limitRowsHint.evalDynamicString(form,{
                        dsId:dsId,dependsOn:form._getDependencies()
                    }));
                }
            },{
                name:"numRows",title:"Row Limit",type:"integer",width:150,
                showIf:function(item,value,form){
                    return!form.levelMode&&!form.creator.creator.isSingletonMode();
                }
            },{
                name:"numLevels",title:"Level Limit",type:"integer",width:150,
                showIf:function(item,value,form){
                    return form.levelMode&&!form.creator.creator.isSingletonMode();
                }
            },{
                name:"rootOnly",title:"Apply criteria to root fetch only",type:"checkbox",
                showIf:function(item,value,form){
                    return form.levelMode;
                }
            },{
                name:"criteriaMode",type:"radioGroup",vertical:false,
                showTitle:false,defaultValue:"useBoth",colSpan:4,
                showIf:function(item,value,form){
                    return form.isDetailDS;
                }
            }],
            setLimitRows:function(limit){
                if(limit){
                    this.enableField("numRows");
                    this.enableField("numLevels");
                }else{
                    this.disableField("numRows");
                    this.disableField("numLevels");
                }
            },
            limitRowsHint:"By default, all records related to records fetched from "+
                           "${dependsOn} will be fetched.  If this is too much data, use "+
                           "criteria on ${dsId} or limit rows fetched from ${dsId}",
            useBothText:"Fetch based on relation to ${dependsOn} plus criteria below",
            critOnlyText:"Use only criteria below",
            _getDependencies:function(){
                var dependencies=[],
                    ds=this.dataSource,
                    context=ds._relationContext;
                if(context&&context.dependsOnRelations){
                    dependencies=isc.getKeys(context.dependsOnRelations);
                }
                return dependencies.join(", ");
            },
            initWidget:function(){
                this.Super("initWidget",arguments);
                this.setValueMap("criteriaMode",{
                    useBoth:this.useBothText.evalDynamicString(this,
                        {dependsOn:this._getDependencies()}),
                    critOnly:this.critOnlyText
                });
                if(this.isDetailDS)this.setLimitRows(false);
            }
        },
        dsConfigSectionCritConstructor:"FilterBuilder",
        dsConfigSectionCritDefaults:{
            neverExpandHeight:true,
            bottomPadding:5
        },
        initWidget:function(){
            this.Super("initWidget",arguments);
            var creator=this.creator,
                singletonMode=creator.isSingletonMode(),
                titleTemplate=creator.dataSourceSectionTitle;
            var sections=[],
                dataSources=this.dataSources;
            for(var i=0;i<dataSources.length;i++){
                var ds=dataSources[i];
                var items=[],section={
                    items:items,expanded:singletonMode,
                    title:titleTemplate.evalDynamicString(this,{dsId:ds.getID()})
                };
                var context=ds._relationContext;
                items.addList([
                    this.createAutoChild("dsConfigSectionForm",{
                        levelMode:!!(context&&context.treeIdField),
                        isDetailDS:!!(context&&context.dependsOnRelations),
                        dataSource:ds
                    }),
                    this.createAutoChild("dsConfigSectionCrit",{
                        dataSource:ds
                    })
                ]);
                if(creator.criteria){
                    items[1].setCriteria(creator.criteria);
                }
                this.addSection(section);
            }
        }
    };
isc.A.cancelButtonDefaults={
        _constructor:"Button",
        title:"Cancel",width:80,
        click:function(){
            this.creator.destroy();
        }
    };
isc.A.exportButtonDefaults={
        _constructor:"Button",
        title:"Export",width:80,
        click:function(){
            this.creator.export();
            this.creator.destroy();
        }
    };
isc.A.buttonLayoutDefaults={
        _constructor:"HLayout",
        membersMargin:5,
        layoutMargin:5,
        align:"right",
        height:1
    };
isc.A.exportFilename="datasources.reify.xml";
isc.A.dataSourceSectionTitle="Settings for fetch against ${dsId}";
isc.A.bodyDefaults={minBreadthMember:0};
isc.B.push(isc.A.isSingletonMode=function isc_MultiDSExportFetchWizard_isSingletonMode(){
        return this.dataSources.length==1;
    }
,isc.A.initWidget=function isc_MultiDSExportFetchWizard_initWidget(){
        this.Super("initWidget",arguments);
        var dsMap=this.dsMap;
        this.dataSources=this.dsNames.map(function(dsName){
            return dsMap[dsName];
        });
        this.globalExportConfig=this.createAutoChild("globalExportConfig");
        this.perDSConfigStack=this.createAutoChild("perDSConfigStack",{
                dataSources:this.dataSources
        });
        this.buttonsLayout=this.createAutoChild("buttonLayout",{
            members:[this.createAutoChild("exportButton"),
                      this.createAutoChild("cancelButton")]
        });
        this.addItems([this.globalExportConfig,this.perDSConfigStack,this.buttonsLayout]);
    }
,isc.A.export=function isc_MultiDSExportFetchWizard_export(){
        var incompleteMessage=this.incompleteMessage,
            globalConfig=this.globalExportConfig.getValues(),
            settings=isc.addProperties({},this.settings,globalConfig,{
                warnOnTooMuchData:true,
                buildDependencies:false,
                incompleteMessage:incompleteMessage
            })
        ;
        var requestProps=[],
            dsNames=this.dsNames,
            stack=this.perDSConfigStack;
        for(var i=0;i<dsNames.length;i++){
            var ds=this.dsMap[dsNames[i]],
                section=stack.sections[i]
            ;
            var customProps=this._getExportSettingsForDataSource(
                ds,settings,section.items[0],section.items[1]);
            if(!isc.isAn.emptyObject(customProps))requestProps[i]=customProps;
        }
        if(requestProps.length){
            requestProps.length=dsNames.length;
            settings.requestProperties=requestProps;
        }
        var debugTarget=window.debugTarget;
        if(!isc.hasOptionalModule("SCServer")||globalConfig.exportMode=="show"){
            return isc.Reify.showMockDS(this.dsNames,null,settings);
        }
        var wizard=this;
        isc.Reify.getMockDS(this.dsNames,function(allDSData,perDSData,incomplete){
            if(allDSData){
                isc.DataSourceNavigator.downloadClientContent(
                    allDSData,wizard.exportFilename,"text");
            }
            if(incomplete){
                isc.Notify.addMessage(incompleteMessage,null,null,{
                    messagePriority:isc.Notify.WARN
                });
            }
        },settings);
    }
,isc.A._getExportSettingsForDataSource=function isc_MultiDSExportFetchWizard__getExportSettingsForDataSource(ds,settings,form,builder){
        var context=ds._relationContext,
            levelMode=!!(context&&context.treeIdField),
            isDetailDS=!!(context&&context.dependsOnRelations),
            props={};
        ;
        var numLevels,numRows;
        if(levelMode){
            numLevels=form.getValue("numLevels");
            if(numLevels!=null&&numLevels!=settings.numLevels){
                props.numLevels=numLevels;
            }
            var rootOnly=form.getValue("rootOnly");
            if(rootOnly)props.rootCriteriaOnly=true;
        }else{
            numRows=form.getValue("numRows");
            if(numRows!=null&&numRows!=settings.numRows){
                props.endRow=numRows;
            }
        }
        var criteria=isc.DS.simplifyAdvancedCriteria(builder.getCriteria(),true);
        if(criteria)props.data=criteria;
        if(isDetailDS){
            var limitRows=form.getValue("limitRows");
            if(!limitRows){
                delete props.endRow;
                delete props.numLevels;
            }else{
                props.endRow=numRows!=null?numRows:settings.numRows;
                props.numLevels=numLevels!=null?numLevels:settings.numLevels;
            }
            var mode=form.getValue("criteriaMode");
            if(mode=="critOnly"){
                props.ignoreRelationCriteria=true;
            }
        }
        return props;
    }
);
isc.B._maxIndex=isc.C+4;

isc.A=isc.DataSource;
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.sessionsDataBase="reify";
isc.B.push(isc.A.loadDeploymentDS=function isc_c_DataSource_loadDeploymentDS(dsIds,deploymentId,callback,loadParents){
        var that=this,
            sandboxedDS=[]
        ;
        that.logInfo("Loading sandboxed version(s) of DataSource(s) "+dsIds+
                     " for deployment "+deploymentId);
        var sandboxContext=this._getSandboxContext(deploymentId);
        isc.DataSource.load(dsIds.duplicate(),function(sandboxedIds){
            that.logInfo("Loaded sandboxed version(s) of DataSource(s) "+dsIds+" as "+
                         sandboxedIds);
            for(var i=0;i<sandboxedIds.length;i++){
                var ds=isc.DataSource.getDataSource(sandboxedIds[i]);
                if(!ds){
                    that.logWarn("Unable to load the sandboxed version of DataSource "+
                                 dsIds[i]);
                    return;
                }
                sandboxedDS.add(ds);
                ds._updateForSandbox(dsIds[i],sandboxContext);
            }
            callback(sandboxedDS);
        },{
            sandboxContext:sandboxContext,
            loadParents:loadParents
        });
    }
,isc.A.getDeploymentDS=function isc_c_DataSource_getDeploymentDS(shortId,deploymentId,callback){
        var sandboxContext=this._getSandboxContext(deploymentId),
            dsId=this._getSandboxedID(shortId,sandboxContext)
        ;
        var ds=this.getDataSource(dsId);
        if(ds){
            if(callback)callback(ds);
            return ds;
        }
        var that=this;
        isc.DS.load(shortId,function(sandboxedIds){
            if(!sandboxedIds||!sandboxedIds.length){
                that.logWarn("Unable to load the sandboxed version of DataSource "+shortId);
                return;
            }
            ds=that.getDataSource(dsId);
            ds._updateForSandbox(shortId,sandboxContext);
            callback(ds);
        },{
            sandboxContext:sandboxContext,
            loadParents:true
        });
    }
,isc.A._getSandboxContext=function isc_c_DataSource__getSandboxContext(deploymentId){
        return{
            dbName:this.sessionsDataBase,
            deploymentId:deploymentId
        };
    }
);
isc.B._maxIndex=isc.C+3;

isc.A=isc.DataSource.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.B.push(isc.A.getAuditDataSourceID=function isc_DataSource_getAuditDataSourceID(){
        return this.audit?this.auditDataSourceID||"audit_"+this.getShortId():null;
    }
,isc.A.getShortId=function isc_DataSource_getShortId(){
        return this._shortId||this.ID;
    }
,isc.A._updateForSandbox=function isc_DataSource__updateForSandbox(shortId,sandboxContext){
        this._shortId=shortId;
        if(this.inheritsFrom){
            var sandboxedParentId=isc.DS._getSandboxedID(this.inheritsFrom,sandboxContext);
            if(isc.DS.get(sandboxedParentId))this.inheritsFrom=sandboxedParentId;
        }
    }
,isc.A._indexFields=function isc_DataSource__indexFields(){
        var index=0,
            fields=this.getFields();
        for(var fieldName in fields){
            fields[fieldName]._fieldOrderIndex=index++;
        }
        this._fieldsIndexed=true;
    }
);
isc.B._maxIndex=isc.C+4;

isc.defineClass("DeploymentManager","VLayout");
isc.A=isc.DeploymentManager.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.width="100%";
isc.A.height="100%";
isc.A.mainViewConstructor="TabSet";
isc.A.mainViewDefaults={
        width:"100%",
        height:"100%",
        tabSelected:function(tabNum,tabPane,ID,tab,name){
            if(isc.SA_Page.isLoaded())isc.History.addHistoryEntry(this.creator.ID+name);
        }
    };
isc.A.usersTitle="Users & Roles";
isc.A.usersPaneConstructor="DeploymentUsersAndRolesEditor";
isc.A.dataTitle="Data";
isc.A.dataPaneConstructor="DeploymentDSNavigator";
isc.A.dataPaneDefaults={
        showDSListRefreshButton:false,
        showDSListExportReifyCSV:false,
        showDSType:false
    };
isc.A.usageTitle="Usage";
isc.A.usagePaneConstructor="DeploymentUsageViewer";
isc.A.headerConstructor="ToolStrip";
isc.A.logoConstructor="Img";
isc.A.logoDefaults={
        autoParent:"header",
        autoDraw:false,
        width:24,
        height:24,
        src:"../graphics/ReifyLogo.png",
        layoutAlign:"center"
    };
isc.A.deploymentTitleConstructor="DynamicForm";
isc.A.deploymentTitleDefaults={
        hiliteRequiredFields:false,
        autoParent:"header",
        autoDraw:false,
        height:26,
        minWidth:250,
        numCols:2,
        colWidth:["*","*"],
        canEdit:false,
        readOnlyDisplay:"static",
        showErrorStyle:false,
        selectOnClick:true,
        selectOnFocus:true,
        defaultItems:[
            {name:"fileName",title:"Managing Deployment",
                wrapTitle:false,
                titleStyle:"pageTitle",
                readOnlyTextBoxStyle:"pageTitle",
                width:"*",
                itemHoverHTML:function(item,form){
                    if(!form.canEdit)return"Double-click to rename deployment";
                },
                escapeHTML:false,
                formatValue:function(value,record,form,item){
                    return form.canEdit?value:value+" <i>("+record.fileType+")</i>";
                },
                shouldApplyStaticTypeFormat:function(){
                    return!this.canEdit;
                },
                hoverStyle:"vbLargeHover",
                validateOnChange:true,
                doubleClick:function(){
                    if(!this.form.canEdit){
                        this.form.setCanEdit(true);
                        this.delayCall("selectValue");
                    }
                },
                keyPress:function(item,form,keyName){
                    var shouldSave=(keyName=="Enter"&&form.validate()),
                        shouldCancelEvent=false;
                    if(!shouldSave&&keyName=="Tab"){
                        if(!form.validate)shouldCancelEvent=true;
                        else shouldSave=true;
                    }
                    if(shouldSave&&form.valuesHaveChanged()){
                        form.setCanEdit(false);
                        form.saveData({
                            target:this,
                            methodName:"nameUpdated"
                        },{willHandleError:true});
                    }else if(keyName=="Escape"){
                        form.resetValues();
                        form.setCanEdit(false);
                    }
                    if(shouldCancelEvent)return false;
                },
                nameUpdated:function(response,data,request){
                    if(response.status==0){
                        this.form.creator.deploymentRenamed(data.fileName);
                    }else{
                        this.logWarn("Name updated failed:"+response.status);
                        if(response.status==-4)this.form.setCanEdit(true);
                        else{
                            isc.warn("Rename failed with the following error:<P>"+data);
                            this.form.resetValues();
                        }
                    }
                }
            }
        ],
        setCanEdit:function(canEdit){
            if(canEdit==this.canEdit)return;
            var shouldFixSize=canEdit,
                item=this.getItem(0);
            if(shouldFixSize){
                item.setWidth(this.getVisibleWidth()-item.getVisibleTitleWidth());
            }else{
                item.setWidth("*");
            }
            var _this=this;
            if(canEdit){
                this._outsideClickEvent=isc.Page.setEvent(
                    "click",function(){_this.clickDuringEdit()});
            }else if(this._outsideClickEvent){
                isc.Page.clearEvent("click",this._outsideClickEvent);
                delete this._outsideClickEvent;
            }
            return this.Super("setCanEdit",arguments);
        },
        clickDuringEdit:function(){
            if(isc.EH.getTarget()==this){
                var itemInfo=this._getEventTargetItemInfo(isc.EH.lastEvent);
                if(itemInfo.item==this.getItem(0)&&!itemInfo.overTitle)return;
            }
            if(!this.valuesHaveChanged())this.setCanEdit(false);
            else{
                if(!this.validate()){
                    this.getItem(0).focusInItem();
                }else{
                    this.setCanEdit(false);
                    this.saveData({
                        target:this.getItem(0),
                        methodName:"nameUpdated"
                    },{willHandleError:true});
                }
            }
        }
    };
isc.A.visitButtonConstructor="ToolStripButton";
isc.A.visitButtonDefaults={
        title:null,
        showRollOver:true,
        showRollOverIcon:true,
        getStateName:function(){
            return this.baseStyle;
        },
        autoApplyDownState:false,
        icon:"../graphics/visit.png",
        prompt:"Visit Deployment",
        hoverStyle:"vbLargeHover",
        click:function(){
           this.creator.visitDeployment();
        }
    };
isc.A.removeButtonConstructor="Button";
isc.A.removeButtonTitle="Remove Deployment";
isc.A.removeButtonDefaults={
        dynamicContents:true,
        getTitle:function(){
            return this.creator.removeButtonTitle;
        },
        click:function(){
            this.creator.removeDeployment();
        }
    };
isc.B.push(isc.A.visitDeployment=function isc_DeploymentManager_visitDeployment(){
        var fileType=this.deploymentType,
            fileName=this.deploymentName,
            orgUrlFragment=this.orgUrlFragment;
        if(fileName==null||fileType==null||orgUrlFragment==null){
            isc.warn("Unable to open deployment");
            return;
        }
        var url=isc.DeploymentManager.getDeploymentURL(fileName,fileType,orgUrlFragment);
        window.open(url);
        isc.say("Deployment opened in new window");
    }
,isc.A.deploymentRenamed=function isc_DeploymentManager_deploymentRenamed(newName){
        this.deploymentName=newName;
    }
,isc.A.removeDeployment=function isc_DeploymentManager_removeDeployment(){
        var _this=this,
            dds=this.deploymentDataSource;
        if(dds!=null){
            isc.ask("Are you sure you want to remove this deployment?<P>"+
                "This operation is permanent and cannot be undone.",
            function(value){
                if(value){
                    isc.showPrompt("Removing deployment from the server",{showModalMask:true});
                    dds.removeData(
                        {id:_this.deploymentId},
                        {target:_this,methodName:"deploymentRemoved"}
                    );
                }
            },
            {title:"Remove Deployment?",showModalMask:true});
        }
    }
,isc.A.deploymentRemoved=function isc_DeploymentManager_deploymentRemoved(){
        this.countdownClose(5);
    }
,isc.A.countdownClose=function isc_DeploymentManager_countdownClose(remaining){
        if(remaining==0){
            window.close();
        }else{
            isc.showPrompt("Deployment successfully removed.<P>"+
                "This window will close in "+remaining+" seconds.",
                {showModalMask:true});
            this.delayCall("countdownClose",[remaining-1],1000);
        }
    }
,isc.A.initWidget=function isc_DeploymentManager_initWidget(){
        this.logo=this.createAutoChild("logo");
        this.deploymentTitle=this.createAutoChild("deploymentTitle",{
            dataSource:this.deploymentDataSource
        });
        this.deploymentTitle.editRecord({
            id:this.deploymentId,fileName:this.deploymentName,
            fileType:this.deploymentType
        });
        this.visitButton=this.createAutoChild("visitButton");
        this.removeButton=this.createAutoChild("removeButton");
        this.addAutoChild("header",{
            members:[
                this.logo,
                this.deploymentTitle,
                this.visitButton,
                isc.LayoutSpacer.create({width:"*"}),
                this.removeButton
            ]
        });
        this.usersPane=this.createAutoChild("usersPane");
        this.dataPane=this.createAutoChild("dataPane",{deploymentId:this.deploymentId});
        this.usagePane=this.createAutoChild("usagePane",{deploymentId:this.deploymentId});
        this.addAutoChild("mainView",
            {
                tabs:[{
                    title:this.usersTitle,pane:this.usersPane,name:"users"
                },{
                    title:this.dataTitle,pane:this.dataPane,name:"data"
                },{
                    title:this.usageTitle,pane:this.usagePane,name:"usage"
                }]
            }
        );
        this.Super("initWidget",arguments);
        var selectTabByHistoryId=function(){
            var historyId=isc.History.getCurrentHistoryId();
            if(!historyId||!historyId.startsWith(this.ID))return;
            var lastTabName=historyId.substring(this.ID.length);
            if(lastTabName)this.mainView.selectTab(lastTabName);
            else this.mainView.selectTab(0);
        };
        isc.History.registerCallback(selectTabByHistoryId.bind(this));
    }
);
isc.B._maxIndex=isc.C+6;

isc.A=isc.DeploymentManager;
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.B.push(isc.A.getDeploymentURL=function isc_c_DeploymentManager_getDeploymentURL(fileName,fileType,orgUrlFrag){
        if(!fileName||!fileType)return null;
        return location.origin+"/"+(fileType=="production"?"app":fileType)+
                                 "/"+orgUrlFrag+"/"+fileName+"/";
    }
);
isc.B._maxIndex=isc.C+1;

isc.defineClass("DeploymentUsersAndRolesEditor","VLayout");
isc.A=isc.DeploymentUsersAndRolesEditor.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.usersDSID="isc_hostedUsers";
isc.A.rolesDSID="isc_hostedRoles";
isc.A.membersMargin=5;
isc.A.sharedAuthWarningText="This deployment is currently authenticated with the Users and Roles from "+
        "deployment ${otherName} <i>(${otherType})</i>.  To stop sharing Users and Roles, "+
        "create a User below.";
isc.A.sharedAuthWarningDismissPrompt="click to dismiss";
isc.A.sharedAuthWarningConstructor="Header";
isc.A.sharedAuthWarningDefaults={
        height:1,
        titleLabelProperties:{
            baseStyle:"sharedAuthHeaderItem"
        }
    };
isc.A.pendingEditsMessage="Changes have been made. Save before switching user(s)?";
isc.A.selectUsersTitle="Select Users";
isc.A.usersFormConstructor="DynamicForm";
isc.A.usersFormDefaults={
        height:1,overflow:"visible"
    };
isc.A.usersItemConstructor="MultiComboBoxItem";
isc.A.usersItemDefaults={
        name:"users",editorType:"MultiComboBoxItem",
        valueField:"userId",
        width:250,
        getDisplayValue:function(value){
            var displayValue="";
            if(value==null)return displayValue;
            var record=this.comboBox.getPickListRecordForValue(value);
            displayValue=this.form.creator.formatUserName(record);
            return displayValue;
        },
        comboBoxProperties:{
            pickListWidth:400,
            filterFields:[
                "userId","firstName","lastName","title"
            ],
            pickListFields:[
                {name:"userId"},
                {name:"firstName"},
                {name:"lastName"},
                {name:"title"}
            ]
        }
    };
isc.A.rolesGridTitle="Roles";
isc.A.rolesGridConstructor="ListGrid";
isc.A.rolesGridDefaults={
        showRollOver:false,
        selectionType:"none",
        showHeaderMenuButton:false,
        canReorderFields:false,
        canGroupBy:false,
        autoFetchData:true,
        dataFetchMode:"basic",
        useAllDataSourceFields:true,
        autoFitData:"vertical",
        canEdit:true,
        editEvent:"click",
        showNewRecordRow:true,
        canRemoveRecords:true,
        modalEditing:true,
        autoSaveEdits:false,
        listEndEditAction:"next",
        setSelectedUsers:function(users){
            this._selectedUsers=users;
            this._markBodyForRedraw();
            if(this.isDrawn())this.getFieldHeaderButton("userHasRole").markForRedraw();
        },
        initWidget:function(){
            this._pendingUserRoleChanges={};
            return this.Super("initWidget",arguments);
        },
        getSelectedStatusForRole:function(role){
            if(this._selectedUsers==null||this._selectedUsers.length==0){
                return"disabled";
            }
            var anySelected=false,allSelected=true;
            if(this._pendingUserRoleChanges[role]!=null){
                anySelected=allSelected=this._pendingUserRoleChanges[role];
            }else{
                for(var i=0;i<this._selectedUsers.length;i++){
                    if(this._selectedUsers[i].isSuperUser||
                        (this._selectedUsers[i].roles&&this._selectedUsers[i].roles.contains(role))
                    )
                    {
                        anySelected=true;
                    }else{
                        allSelected=false;
                    }
                }
            }
            return(allSelected?"selected":anySelected?"partial":"none");
        },
        getHasRoleFieldTitle:function(){
            var anySelected=false,
            allSelected=true,
            data=this.getData();
            if(data!=null&&this._selectedUsers!=null){
                var total=data.getLength();
                if(isc.ResultSet&&isc.isA.ResultSet(data)&&data.rangeIsLoaded(0,total)){
                    for(var i=0;i<total;i++){
                        var roleRecord=data.get(i),
                            roleSelectedStatus=this.getSelectedStatusForRole(roleRecord.name);
                        if(roleSelectedStatus=="selected"){
                            anySelected=true;
                        }else{
                            if(roleSelectedStatus=="partial"){
                                anySelected=true;
                            }
                            allSelected=false;
                        }
                    }
                }
            }
            var editedMarker=!isc.isAn.emptyObject(this._pendingUserRoleChanges)?"*":"&nbsp;";
            return this._getCheckboxValueIconHTML(
                    anySelected,(anySelected&&!allSelected),
                    true,this.isDisabled()||(this._selectedUsers==null),this
                )+editedMarker;
        },
        headerHoverHTML:function(fieldNum,defaultHTML){
            if(this.getField(fieldNum).name=="userHasRole"){
                if(!isc.isAn.emptyObject(this._pendingUserRoleChanges)){
                    return this.creator.editedUsersHaveRolesHeaderPrompt;
                }else{
                    return this.creator.usersHaveRolesHeaderPrompt;
                }
            }else return defaultHTML;
        },
        canEditCell:function(rowNum,colNum){
            var fieldName=this.getFieldName(colNum);
            if(fieldName=="name"){
                return rowNum>=this.data.getLength();
            }
            return this.Super("canEditCell",arguments);
        },
        allowRoleUpdates:true,
        fields:[
            {name:"userHasRole",prompt:this.roleSelectedPrompt,
                type:"text",
                width:40,
                formatCellValue:function(value,record,rowNum,colNum,grid){
                    var name=record.name,
                        roleStatus=grid.getSelectedStatusForRole(name),
                        disabled=roleStatus=="disabled",
                        allSelected=roleStatus=="selected",
                        someSelected=allSelected||roleStatus=="partial";
                    return grid._getCheckboxValueIconHTML(
                        someSelected,!allSelected,true,disabled||grid.isDisabled(),grid
                    );
                },
                showHover:true,
                hoverHTML:function(record,value,rowNum,colNum,grid){
                    if(record==null)return;
                    var name=record.name,
                        roleStatus=grid.getSelectedStatusForRole(name);
                    switch(roleStatus){
                        case"disabled":
                            return grid.creator.noSelectedUsersPrompt;
                        case"selected":
                            return grid.creator.usersHaveRolePrompt;
                        case"partial":
                            return grid.creator.partialUsersHaveRolePrompt;
                        default:
                            return grid.creator.noUsersHaveRolePrompt;
                    }
                },
                canDragResize:false,canHide:false,canReorder:false,
                canSort:false,canGroupBy:false,canEdit:false,
                recordClick:function(viewer,record,recordNum,field,fieldNum,value,rawValue){
                    if(record==null)record=viewer.getEditedRecord(recordNum);
                    if(viewer.allowRoleUpdates){
                        viewer.toggleUserRole(record);
                    }else{
                        isc.Hover.show(viewer.creator.noSelectedUsersPrompt);
                    }
                    return false;
                },
                getTitle:function(){
                    return this.grid.getHasRoleFieldTitle();
                }
            },
            {
                name:"name",required:true,
                validators:[
                    {
                        type:"custom",
                        errorMessage:"Role name must be unique",
                        condition:function(item,validator,value,record,additionalContext){
                            var grid=additionalContext.component,
                                rowNum=additionalContext.rowNum;
                            for(var i=0;i<grid.getTotalRows();i++){
                                if(rowNum==i)continue;
                                if(grid.getEditedRecord(i).name==value){
                                    return false;
                                }
                            }
                            return true;
                        }
                    }
                ]
            }
        ],
        headerClick:function(field){
            field=this.getField(field);
            if(this.allowRoleUpdates&&field.name=="userHasRole"){
                this.toggleAllUserRoles();
            }else{
                return this.Super("headerClick",arguments);
            }
        },
        removeRecordClick:function(){
            this.Super("removeRecordClick",arguments);
            this.updateSaveButton();
        },
        toggleUserRole:function(record){
            if(this._selectedUsers==null||this._selectedUsers.length==0)return;
            if(this._pendingUserRoleChanges[record.name]!=null){
                this._pendingUserRoleChanges[record.name]=
                    !this._pendingUserRoleChanges[record.name];
            }else{
                var shouldAddRole=true;
                for(var i=0;i<this._selectedUsers.length;i++){
                    if(this._selectedUsers[i].isSuperUser||
                        (this._selectedUsers[i].roles&&
                         this._selectedUsers[i].roles.contains(record.name))
                    ){
                        shouldAddRole=false;
                        break;
                    }
                }
                this._pendingUserRoleChanges[record.name]=shouldAddRole;
            }
            this._markBodyForRedraw();
            this.getFieldHeaderButton("userHasRole").markForRedraw();
            this.updateSaveButton();
        },
        toggleAllUserRoles:function(){
            if(this._selectedUsers==null||this._selectedUsers.length==0)return;
            var roles=[],
                shouldSelect=true;
            for(var i=0;i<this.data.getLength();i++){
                var record=this.data.get(i);
                roles[i]=record.name;
                if(!shouldSelect)continue;
                if(this._pendingUserRoleChanges[roles[i]]!=null){
                    if(this._pendingUserRoleChanges[roles[i]]){
                        shouldSelect=false;
                    }
                }else{
                    for(var ii=0;ii<this._selectedUsers.length;ii++){
                        var user=this._selectedUsers[ii];
                        if(user.isSuperUser||
                            (user.roles&&user.roles.contains(roles[i])))
                        {
                            shouldSelect=false;
                            break;
                        }
                    }
                }
            }
            var editedVals={};
            for(var i=0;i<roles.length;i++){
                editedVals[roles[i]]=shouldSelect;
            }
            this._pendingUserRoleChanges=editedVals;
            this._markBodyForRedraw();
            this.getFieldHeaderButton("userHasRole").markForRedraw();
            this.updateSaveButton();
        },
        setFields:function(){
            var rv=this.Super("setFields",arguments),
                fields=this.getFields(),
                _this=this;
            for(var i=0;i<fields.length;i++){
                fields[i].changed=function(form,item,value,oldValue){
                    _this.updateSaveButton();
                };
            }
            return rv;
        },
        _clearEditValues:function(){
            var rv=this.Super("_clearEditValues",arguments);
            this.updateSaveButton();
            return rv;
        },
        updateSaveButton:function(){
            var hasChanges=this.hasChanges()||!isc.isAn.emptyObject(this._pendingUserRoleChanges);
            this.creator.discardButton.setDisabled(
                !hasChanges
            );
            this.creator.saveButton.setDisabled(
                !hasChanges
            );
            this.creator.duplicateButton.setDisabled(
                hasChanges||
                !(this.creator.selectedUsers&&this.creator.selectedUsers.length==1)
            );
        },
        discardAllChanges:function(){
            this._pendingUserRoleChanges={};
            this.discardAllEdits();
            this._markBodyForRedraw();
            this.getFieldHeaderButton("userHasRole").markForRedraw();
        },
        saveAllChanges:function(callback){
            this.creator.setSelectedUserRoles(this._pendingUserRoleChanges);
            this._pendingUserRoleChanges={};
            this.saveAllEdits(null,callback);
            this._markBodyForRedraw();
            this.getFieldHeaderButton("userHasRole").markForRedraw();
        }
    };
isc.A.usersHaveRolesHeaderPrompt="Roles for selected user(s)";
isc.A.editedUsersHaveRolesHeaderPrompt="Roles for selected user(s) [<i>Edited</i>]";
isc.A.noSelectedUsersPrompt="No selected user(s)";
isc.A.usersHaveRolePrompt="This role is currently assigned to selected user(s).";
isc.A.partialUsersHaveRolePrompt="This role is currently assigned to some but not all selected user(s).";
isc.A.noUsersHaveRolePrompt="This role is currently not assigned to selected user(s).";
isc.A.duplicateButtonConstructor="Button";
isc.A.duplicateButtonDefaults={
        title:"Apply Assigned Roles to other user[s]",
        canHover:true,
        showHover:true,
        hoverWidth:250,
        getHoverHTML:function(){
            var prompt="Copy roles from selected user to other user[s]";
            if(this.isDisabled()){
                if(this.creator.selectedUsers&&this.creator.selectedUsers.length==1
                    &&(this.creator.rolesGrid.hasChanges()||
                        !isc.isAn.emptyObject(this.creator.rolesGrid._pendingUserRoleChanges))
                ){
                    prompt+="<br>To enable, save edits";
                }else{
                    prompt+="<br>To enable, select a single user";
                }
            }
            return prompt;
        },
        overflow:"visible",
        disabled:true,
        click:function(){
            this.creator.showCopyUserRolesUI();
        }
    };
isc.A.addButtonConstructor="Button";
isc.A.addButtonDefaults={
        title:"Add Role",
        click:function(){
            this.creator.rolesGrid.startEditingNew();
        }
    };
isc.A.discardButtonConstructor="Button";
isc.A.discardButtonDefaults={
        title:"Discard Changes",
        disabled:true,
        click:function(){
            this.creator.rolesGrid.discardAllChanges();
        }
    };
isc.A.saveButtonConstructor="Button";
isc.A.saveButtonDefaults={
        title:"Save",
        disabled:true,
        click:function(){
            this.creator.rolesGrid.saveAllChanges(null,
                {target:this.creator,methodName:"rolesUpdated"});
        }
    };
isc.A.changeID=0;
isc.A.createUserButtonConstructor="Button";
isc.A.createUserButtonDefaults={
        title:"Create User",
        click:function(){
            this.creator.createUser();
        }
    };
isc.A.editUserButtonConstructor="Button";
isc.A.editUserButtonDefaults={
        title:"Edit User",
        disabled:true,
        click:function(){
            this.creator.editSelectedUser();
        }
    };
isc.A.changePasswordButtonTitle="Change Password";
isc.A.changePasswordButtonConstructor="Button";
isc.A.changePasswordButtonDefaults={
        disabled:true,
        click:function(){
            this.creator.showChangePasswordWindow();
        }
    };
isc.A.deleteUsersButtonConstructor="Button";
isc.A.deleteUsersButtonDefaults={
        title:"Delete User(s)",
        disabled:true,
        click:function(){
            this.creator.deleteSelectedUsers();
        }
    };
isc.A.userEditWindowConstructor="Window";
isc.A.userEditWindowDefaults={
        autoSize:true,
        isModal:true,
        showModalMask:true,
        autoCenter:true
    };
isc.A.userEditFormConstructor="DynamicForm";
isc.A.userEditFormDefaults={
        defaultItems:[
            {name:"userId",readOnlyDisplay:"static",validateOnExit:true},
            {name:"email",validateOnExit:true,
             validators:isc.Validator.getStandardEmailValidators()},
            {name:"firstName"},
            {name:"lastName"},
            {name:"title"},
            {name:"phoneNumber"},
            {name:"isSuperUser"},
            {name:"autoGenPwd",shouldSaveValue:false,title:"Auto-generate user password?",
             prompt:"Should the user password be automatically generated by the server "+
                "and emailed to the user?<br>"+
                "Deselect to enter a new password explicitly.",
             editorType:"CheckboxItem",defaultValue:true,
             showTitle:false,colSpan:2,
             changed:function(form,item,value){
                if(value){
                    form.getItem("password").clearValue();
                    form.getItem("password").clearErrors();
                    form.getItem("confirmPassword").clearValue();
                    form.getItem("confirmPassword").clearErrors();
                    form.getItem("password").setDisabled(true);
                    form.getItem("confirmPassword").setDisabled(true);
                }else{
                    form.getItem("password").setDisabled(false);
                    form.getItem("confirmPassword").setDisabled(false);
                }
             }
            },
            {name:"password",editorType:"password",title:"Password",disabled:true,
             validators:[{type:"requiredIf",expression:"!item.form.getValue('autoGenPwd')"}]},
            {name:"confirmPassword",editorType:"password",
                shouldSaveValue:false,title:"Confirm Password",
                requiredIf:"form.getValue('password' != null)",
                validators:[
                    {type:"requiredIf",expression:"!item.form.getValue('autoGenPwd')"},
                    {type:"matchesField",otherField:"password"}
                ],
                disabled:true
            }
        ],
        width:400
    };
isc.A.saveUserButtonTitle="Save";
isc.A.saveUserButtonConstructor="Button";
isc.A.saveUserButtonDefaults={
        layoutAlign:"center",
        click:function(){
            this.creator.userEditForm.saveData({
                target:this.creator,methodName:"saveUserCallback"
            });
        }
    };
isc.A.changePasswordTitle="Change User Password";
isc.A.changePasswordWindowConstructor="Window";
isc.A.changePasswordWindowDefaults={
        autoCenter:true,
        autoSize:true,
        isModal:true,
        showModalMask:true
    };
isc.A.changePasswordFormConstructor="DynamicForm";
isc.A.changePasswordFormDefaults={
        hiliteRequiredFields:false,
        wrapItemTitles:false,
        defaultItems:[
            {name:"autoGen",title:"Auto-generate new password?",
             prompt:"Should the new password be automatically generated by the server "+
                "and emailed to the user?<br>"+
                "Deselect to enter a new password explicitly.",
             editorType:"CheckboxItem",defaultValue:true,
             showTitle:false,colSpan:2,
             changed:function(form,item,value){
                if(value){
                    form.getItem("password").clearValue();
                    form.getItem("password").clearErrors();
                    form.getItem("confirmPassword").clearValue();
                    form.getItem("confirmPassword").clearErrors();
                    form.getItem("password").setDisabled(true);
                    form.getItem("confirmPassword").setDisabled(true);
                }else{
                    form.getItem("password").setDisabled(false);
                    form.getItem("confirmPassword").setDisabled(false);
                }
             }
            },
            {name:"password",editorType:"Password",
             title:"Enter Password",
             disabled:true,
             validators:[
                {type:"required",errorMessage:"Please enter a new password"}
             ]
            },
            {name:"confirmPassword",editorType:"Password",
             title:"Confirm Password",
             disabled:true,
             validators:[
                {type:"required",errorMessage:"Please verify the password by re-entering it here"},
                {type:"matchesField",otherField:"password",
                 validateOnChange:true,
                 errorMessage:"Passwords do not match"}
             ]
            }
        ]
    };
isc.A.resetUserPasswordConfirmationMessage="This action will generate a new password on the server and send it to the user via email.<br>"+
                                        "Proceed?";
isc.A.copyUserRolesTitle="Copy Roles";
isc.A.copyUserRolesWindowConstructor="ModalWindow";
isc.A.copyUserRolesWindowDefaults={
        showModalMask:true,isModal:true,
        clear:function(){
            this.creator.copyUserSourceGrid.setData([]);
            this.creator.copyUserTargetForm.clearValues();
            this.creator.copyTargetUserUI.setVisibility("hidden");
            return this.Super("clear",arguments);
        },
        close:function(){
            this.clear();
        }
    };
isc.A.copyUserRolesSourceGridConstructor="ListGrid";
isc.A.copyUserTargetItemTitle="Target user(s)";
isc.A.copyUserApplyButtonConstructor="Button";
isc.A.copyUserApplyButtonDefaults={
        overflow:"visible",
        title:"Apply roles to target user(s)",
        layoutAlign:"center",
        click:function(){
            this.creator.copyUserRoles();
        }
    };
isc.A.copyFromSuperUserWarningTitle="Copy user roles";
isc.A.copyFromSuperUserWarning="<b>Note: Copying user roles from super user will not copy superuser status</b><P>"+
                "This user is a superuser. Copying user roles from a super user will assign all "+
                "currently available roles to target user(s), but will not make them superusers.<br>"+
                "If additional roles are defined for this deployment in the future, "+
                "the target user(s) will not have access to them automatically.<P>"+
                "To make a user a superuser, set the superuser "+
                "flag on that user via 'Edit User' button (above).";
isc.A.targetUsersFetchID=0;
isc.A.copyWillRemoveWarning="Applying these roles would remove roles that users already have.  Proceed?";
isc.A.copyWillRemoveDialogConstructor="Dialog";
isc.A.copyWillRemoveDialogDefaults={
        icon:"[SKIN]ask.png",
        initWidget:function(){
            this.buttons=[
                isc.Button.create({title:"Proceed",isProceedButton:true}),
                isc.Button.create({title:"Cancel",isCancelButton:true}),
                isc.Button.create({title:"Add Roles Only",isAddRolesButton:true,
                    prompt:"Add roles only, don't remove roles"})
            ];
            return this.Super("initWidget",arguments);
        },
        buttonClick:function(button,index){
            this.clear();
            if(button.isCancelButton)return;
            this.creator.applyRolesToUsers(this.sourceRoles,button.isAddRolesButton);
        }
    };
isc.B.push(isc.A.loadSandboxedDataSources=function isc_DeploymentUsersAndRolesEditor_loadSandboxedDataSources(callback){
        var _this=this,
            viewer=this.creator;
        isc.DS.loadDeploymentDS([this.usersDSID,this.rolesDSID],viewer.deploymentId,
            function(dataSources){
                _this._usersDS=isc.DataSource.get(dataSources[0]);
                _this._usersDS.getField("roles").hidden=true;
                _this._rolesDS=isc.DataSource.get(dataSources[1]);
                _this.fireCallback(callback);
            });
    }
,isc.A.getUsersDS=function isc_DeploymentUsersAndRolesEditor_getUsersDS(){
        if(this._usersDS==null&&!this._warnedOnNoUsersDS){
            this._warnedOnNoUsersDS=true;
            this.logWarn("Users datasource load failed - check server logs");
        }
        return this._usersDS;
    }
,isc.A.getRolesDS=function isc_DeploymentUsersAndRolesEditor_getRolesDS(){
        if(this._rolesDS==null&&!this._warnedOnNoRolesDS){
            this._warnedOnNoRolesDS=true;
            this.logWarn("Users datasource load failed - check server logs");
        }
        return this._rolesDS;
    }
,isc.A.formatUserName=function isc_DeploymentUsersAndRolesEditor_formatUserName(record){
        var displayValue="";
        if(record==null)return displayValue;
        if(record.firstName)displayValue+=record.firstName+" ";
        if(record.lastName)displayValue+=record.lastName+" ";
        if(record.title)displayValue+="("+record.title+")";
        return displayValue;
    }
,isc.A.initWidget=function isc_DeploymentUsersAndRolesEditor_initWidget(){
        this.loadSandboxedDataSources({target:this,methodName:"buildUI"});
        return this.Super("initWidget",arguments);
    }
,isc.A.buildUI=function isc_DeploymentUsersAndRolesEditor_buildUI(){
        this.usersForm=this.createAutoChild("usersForm",{
            items:[
                isc.addProperties(
                    {editorType:this.usersItemConstructor},
                    this.usersItemDefaults,
                    {title:this.selectUsersTitle,
                        optionDataSource:this.getUsersDS(),
                        changed:function(form,item,value){
                            this.form.creator.updateSelectedUsers(value);
                        },
                        change:function(form,item,value,oldValue){
                            if(this.form.creator.warnOnPendingEdits(value))return false;
                        }
                    }
                )
            ]
        });
        this.createUserButton=this.createAutoChild("createUserButton");
        this.editUserButton=this.createAutoChild("editUserButton");
        this.changePasswordButton=this.createAutoChild("changePasswordButton",{
            title:this.changePasswordButtonTitle
        });
        this.deleteUsersButton=this.createAutoChild("deleteUsersButton");
        this.rolesGrid=this.createAutoChild("rolesGrid",{
            dataSource:this.getRolesDS()
        });
        this.addButton=this.createAutoChild("addButton");
        this.discardButton=this.createAutoChild("discardButton");
        this.saveButton=this.createAutoChild("saveButton");
        this.duplicateButton=this.createAutoChild("duplicateButton");
        this.setMembers([
            this.usersForm,
            isc.HLayout.create({
                height:1,
                membersMargin:5,
                members:[
                    this.createUserButton,
                    this.editUserButton,
                    this.changePasswordButton,
                    this.deleteUsersButton
                ]
            }),
            isc.Label.create({
                contents:this.rolesGridTitle,
                height:1,
                styleName:"headerItem"
            }),
            this.rolesGrid,
            isc.HLayout.create({
                height:1,
                membersMargin:5,
                members:[
                   this.duplicateButton,
                    isc.LayoutSpacer.create({
                        width:"*"
                    }),
                    this.addButton,
                    this.discardButton,
                    this.saveButton
                ]
            })
        ]);
        var _this=this,
            manager=this.creator,
            depRec=manager.deploymentRecord;
        if(depRec.authentication=="fromDeployment"&&depRec.authShareUsers){
            manager.deploymentDataSource.fetchData({id:depRec.authDeployment},
                function(response,data,request){
                    if(data&&data[0])_this.addSharedAuthWarning(data[0]);
                },{operationId:"summary",willHandleError:true}
            );
        }
    }
,isc.A.addSharedAuthWarning=function isc_DeploymentUsersAndRolesEditor_addSharedAuthWarning(otherDeployment){
        this.sharedAuthWarning=this.createAutoChild("sharedAuthWarning",{
            members:[
                isc.ImgButton.create({
                    autoDraw:false,src:"[SKIN]actions/cancel.png",size:16,
                    showFocused:false,showRollOver:false,showDown:false,
                    prompt:this.sharedAuthWarningDismissPrompt,
                    click:"this.parentElement.hide()"
                })
            ],
            title:this.sharedAuthWarningText.evalDynamicString(this,{
                otherName:otherDeployment.fileName,
                otherType:otherDeployment.fileType
            })
        });
        this.addMembers(this.sharedAuthWarning,0);
    }
,isc.A.stopSharingUsersAndRoles=function isc_DeploymentUsersAndRolesEditor_stopSharingUsersAndRoles(){
        var manager=this.creator;
        manager.deploymentDataSource.updateData({
            id:manager.deploymentId,authShareUsers:false
        });
        this.sharedAuthWarning.destroy();
        this.sharedAuthWarning=null;
    }
,isc.A.warnOnPendingEdits=function isc_DeploymentUsersAndRolesEditor_warnOnPendingEdits(newUser){
        if(this.rolesGrid.hasChanges()||!isc.isAn.emptyObject(this.rolesGrid._pendingUserRoleChanges)){
            var _this=this;
            isc.ask(this.pendingEditsMessage,
                function(value){
                    if(!value){
                        _this.rolesGrid.discardAllChanges();
                    }else{
                        _this.rolesGrid.saveAllChanges();
                    }
                    _this.usersForm.setValue("users",newUser);
                    _this.updateSelectedUsers(newUser);
                }
            );
            return true;
        }
    }
,isc.A.rolesUpdated=function isc_DeploymentUsersAndRolesEditor_rolesUpdated(){
        this.updateSaveButton();
    }
,isc.A.updateSelectedUsers=function isc_DeploymentUsersAndRolesEditor_updateSelectedUsers(userIds){
        if(userIds!=null&&!isc.isAn.Array(userIds))userIds=[userIds];
        this.editUserButton.setDisabled(!userIds||userIds.length!=1);
        this.changePasswordButton.setDisabled(!userIds||userIds.length!=1);
        this.deleteUsersButton.setDisabled(!userIds||userIds.length==0);
        this.duplicateButton.setDisabled(!userIds||userIds.length!=1);
        if(userIds==null||userIds.length==0){
            this.selectedUsers=[];
            this.rolesGrid.setSelectedUsers(this.selectedUsers.duplicate());
            return;
        }else{
            var changeID=++this.changeID;
            this.getUsersDS().fetchData(
                {userId:userIds},
                {target:this,methodName:"_fetchUsersByIdReply"},
                {clientContext:{changeID:changeID}}
            );
        }
    }
,isc.A._fetchUsersByIdReply=function isc_DeploymentUsersAndRolesEditor__fetchUsersByIdReply(dsResponse,data,dsRequest){
        if(dsResponse.clientContext.changeID!=this.changeID)return;
        this._updateSelectedUsers(data);
    }
,isc.A._updateSelectedUsers=function isc_DeploymentUsersAndRolesEditor__updateSelectedUsers(data){
        this.selectedUsers=data;
        if(data&&data.length>0){
            this.rolesGrid.setSelectedUsers(this.selectedUsers.duplicate());
        }
    }
,isc.A.getRolesForUser=function isc_DeploymentUsersAndRolesEditor_getRolesForUser(user,callback){
        var roles=user.roles;
        if(roles==null)roles=[];
        else if(isc.isAn.Array(roles))roles=roles.duplicate();
        else roles=[roles];
        if(user.isSuperUser){
            var allRoles=this.rolesGrid.data.getRange(0,this.rolesGrid.getTotalRows());
            for(var ii=0;ii<allRoles.length;ii++){
                var roleId=allRoles[ii].name;
                if(roles.indexOf(roleId)==-1){
                    roles.add(roleId);
                }
            }
        }
        roles.removeEmpty();
        return roles;
    }
,isc.A.setSelectedUserRoles=function isc_DeploymentUsersAndRolesEditor_setSelectedUserRoles(roleMappings){
        var users=this.selectedUsers;
        if(users==null||users.length==0)return;
        var wasQueuing=isc.RPCManager.startQueue();
        for(var i=0;i<users.length;i++){
            var user=users[i],
                updateSuperFlag=false,
                isSuperUser=user.isSuperUser,
                userRoles=this.getRolesForUser(user);
            for(var role in roleMappings){
                var add=roleMappings[role];
                if(add){
                    if(userRoles.indexOf(role)==-1){
                        userRoles.add(role);
                    }
                }else{
                    if(isSuperUser)updateSuperFlag=true;
                    userRoles.remove(role);
                }
            }
            if(isSuperUser){
                if(!updateSuperFlag)continue;
                else user.isSuperUser=false;
            }
            user.roles=userRoles;
            var callback=(i==users.length-1)
                    ?{target:this,methodName:"userRolesUpdated"}:null;
            this.getUsersDS().updateData(user,callback);
        }
        if(!wasQueuing)isc.RPCManager.sendQueue();
    }
,isc.A.userRolesUpdated=function isc_DeploymentUsersAndRolesEditor_userRolesUpdated(responses){
        this.updateSelectedUsers(this.usersForm.getValue("users"));
        this.rolesGrid.updateSaveButton();
    }
,isc.A.saveUserCallback=function isc_DeploymentUsersAndRolesEditor_saveUserCallback(dsResponse,data,dsRequest){
        if(this.sharedAuthWarning)this.stopSharingUsersAndRoles();
        this.userEditWindow.hide();
    }
,isc.A.createUserEditUI=function isc_DeploymentUsersAndRolesEditor_createUserEditUI(){
        this.userEditForm=this.createAutoChild("userEditForm",{
            dataSource:this.getUsersDS()
        });
        this.saveUserButton=this.createAutoChild("saveUserButton",{
            title:this.saveUserButtonTitle
        });
        this.userEditWindow=this.createAutoChild("userEditWindow",{
            items:[
                this.userEditForm,
                isc.LayoutSpacer.create({height:10}),
                this.saveUserButton
            ]
        });
    }
,isc.A.createUser=function isc_DeploymentUsersAndRolesEditor_createUser(){
        if(this.userEditWindow==null){
            this.createUserEditUI();
        }
        this.userEditForm.showItem("autoGenPwd");
        this.userEditForm.showItem("password");
        this.userEditForm.showItem("confirmPassword");
        this.userEditWindow.setTitle("Create user");
        this.userEditForm.clearErrors();
        this.userEditForm.getItem("userId").setCanEdit(true);
        this.userEditForm.editNewRecord();
        this.userEditWindow.show();
    }
,isc.A.editSelectedUser=function isc_DeploymentUsersAndRolesEditor_editSelectedUser(){
        if(this.userEditWindow==null){
            this.createUserEditUI();
        }
        this.userEditForm.hideItem("autoGenPwd");
        this.userEditForm.hideItem("password");
        this.userEditForm.hideItem("confirmPassword");
        this.userEditWindow.setTitle("Edit user");
        this.userEditForm.getItem("userId").setCanEdit(false);
        this.userEditForm.clearErrors();
        this.userEditForm.editRecord(this.selectedUsers[0]);
        this.userEditWindow.show();
    }
,isc.A.createChangePasswordUI=function isc_DeploymentUsersAndRolesEditor_createChangePasswordUI(){
        this.changePasswordForm=this.createAutoChild("changePasswordForm"),
        this.changePasswordWindow=this.createAutoChild("changePasswordWindow",
        {
            title:"Reset password for selected user",
            items:[
                this.changePasswordForm,
                isc.Button.create({
                    title:"Reset Password",
                    layoutAlign:"center",
                    builder:this,
                    click:function(){
                        var form=this.builder.changePasswordForm;
                        if(form.getValue("autoGen")){
                            this.builder.resetUserPassword();
                        }else{
                            if(!form.validate()){
                                return;
                            }
                            var password=form.getValue("password");
                            form.clearValues();
                            form.setValue("autoGen",true);
                            form.getItem("password").setDisabled(true);
                            form.getItem("confirmPassword").setDisabled(true);
                            this.builder.changeUserPassword(password);
                        }
                    }
                })
            ]
        });
    }
,isc.A.showChangePasswordWindow=function isc_DeploymentUsersAndRolesEditor_showChangePasswordWindow(){
        if(this.selectedUsers.length!=1)return;
        if(this.changePasswordWindow==null){
            this.createChangePasswordUI();
        }
        this.changePasswordWindow.show();
    }
,isc.A.changeUserPassword=function isc_DeploymentUsersAndRolesEditor_changeUserPassword(password){
        var record={
            password:password,
            userId:this.selectedUsers[0].userId
        };
        this.getUsersDS().updateData(
            record,
            {target:this,methodName:"passwordUpdated"},
            {showPrompt:true}
        );
    }
,isc.A.resetUserPassword=function isc_DeploymentUsersAndRolesEditor_resetUserPassword(){
        var _this=this,
            user=this.selectedUsers[0];
        isc.confirm(this.resetUserPasswordConfirmationMessage,
                    function(value){
                        if(!value)return;
                        var URL=isc.Auth.getPasswordResetURL(user);
                        if(URL==null){
                            _this.logWarn("Unable to determine password reset URL. Verify "+
                                "that isc.Authentication.resetPasswordURL has been populated.");
                            _this.changePasswordWindow.clear();
                            isc.warn("Unable to reset user password.");
                        }else{
                            isc.RPCManager.sendRequest(
                                {actionURL:URL,useSimpleHTTP:true,showPrompt:true},
                                {target:_this,methodName:"passwordUpdated"}
                            );
                        }
                    }
        );
    }
,isc.A.passwordUpdated=function isc_DeploymentUsersAndRolesEditor_passwordUpdated(){
        this.changePasswordWindow.clear();
        isc.say("Password updated");
    }
,isc.A.deleteSelectedUsers=function isc_DeploymentUsersAndRolesEditor_deleteSelectedUsers(){
        var confirmString;
        if(this.selectedUsers.length==1){
            var user=this.selectedUsers[0];
            confirmString="Delete user "+this.formatUserName(user);
        }else confirmString="Delete "+this.selectedUsers.length+" selected users?";
        isc.confirm(confirmString,
                {target:this,methodName:"_deleteSelectedUsers"},
                {title:"Confirm Delete"});
    }
,isc.A._deleteSelectedUsers=function isc_DeploymentUsersAndRolesEditor__deleteSelectedUsers(value){
        if(!value)return;
        isc.RPCManager.startQueue();
        for(var i=0;i<this.selectedUsers.length;i++){
            var user=this.selectedUsers[i];
            this.getUsersDS().removeData(user);
        }
        isc.RPCManager.sendQueue();
        this.usersForm.clearValues();
        this.updateSelectedUsers([]);
    }
);
isc.evalBoundary;isc.B.push(isc.A.showCopyUserRolesUI=function isc_DeploymentUsersAndRolesEditor_showCopyUserRolesUI(superUserWarningDisplayed){
        var sourceUser=this.selectedUsers[0];
        if(!superUserWarningDisplayed&&this.copyFromSuperUserWarning&&sourceUser.isSuperUser){
            var _this=this;
            isc.say(this.copyFromSuperUserWarning,
                function(){
                    _this.showCopyUserRolesUI(true);
                },
                {title:this.copyFromSuperUserWarningTitle}
            );
            return;
        }
        if(this.copyUserRolesWindow==null){
            this.copyUserRolesWindow=this.createAutoChild("copyUserRolesWindow",{
                title:this.copyUserRolesTitle
            });
            this.copyUserSourceGrid=this.createAutoChild("copyUserRolesSourceGrid",{
                canEdit:false,
                showRollOver:false,
                selectionType:"none",
                canGroupBy:false,
                dataSource:this.getRolesDS()
            });
            var usersItemConfig=isc.addProperties(
                {editorType:this.usersItemConstructor},
                this.usersItemDefaults,
                {title:this.copyUserTargetItemTitle,
                    optionDataSource:this.getUsersDS(),
                    changed:function(form,item,value){
                        this.form.creator.updateSelectedTargetUsers(value);
                    },
                    change:function(form,item,value,oldValue){
                        var selectedUser=this.comboBox.getSelectedRecord();
                        if(selectedUser.isSuperUser)return false;
                    }
                }
            );
            isc.addProperties(usersItemConfig.comboBoxProperties,
                {
                    getPickListFilterCriteria:function(){
                        var MCBI=this.form.creator,
                            selectedUser=MCBI.form.creator.selectedUsers[0];
                        return{
                            _constructor:"AdvancedCriteria",
                            operator:"notEqual",
                            fieldName:"userId",
                            value:selectedUser.userId
                        };
                    },
                    pickListProperties:{
                        recordIsEnabled:function(record,row,col){
                            if(record.isSuperUser)return false;
                            return this.Super("recordIsEnabled",arguments);
                        },
                        showHoverOnDisabledCells:true,
                        canHover:true,
                        cellHoverHTML:function(record,rowNum,colNum){
                            if(record.isSuperUser){
                                return"This user is a super-user and already has access to all roles.<br>"+
                                    " To remove super-user status, use the 'Edit User' option above";
                            }
                        }
                    }
                }
            );
            this.copyUserTargetForm=this.createAutoChild("usersForm",{
                items:[usersItemConfig]
            });
            this.copyUserTargetGrid=this.createAutoChild("rolesGrid",{
                showHeaderMenuButton:false,
                canEdit:false,
                allowRoleUpdates:false,
                canRemoveRecords:false,
                canEditRoles:false,
                dataSource:this.getRolesDS()
            });
            this.copyUserApplyButton=this.createAutoChild("copyUserApplyButton");
            this.copyTargetUserUI=isc.VLayout.create({
                membersMargin:5,
                visibility:"hidden",
                members:[
                    isc.Label.create({
                        height:1,padding:5,
                        contents:"Current Roles for target user(s).<br>"+
                                "(These will be replaced by roles from the selected user)"
                    }),
                    this.copyUserTargetGrid,
                    this.copyUserApplyButton
                ]
            });
            var _creator=this;
            this.copyUserRolesWindow.items=[
                isc.HLayout.create({
                    members:[
                        isc.VLayout.create({
                            members:[
                                isc.Label.create({
                                    padding:5,
                                    height:1,
                                    getSelectedUserTitle:function(){
                                        var user=_creator.selectedUsers[0];
                                        return user.firstName+" "+user.lastName+
                                            (user.title?" ("+user.title+")":"");
                                    },
                                    dynamicContents:true,
                                    contents:"Selected Roles for user ${this.getSelectedUserTitle()}"
                                }),
                                this.copyUserSourceGrid
                            ],
                            showResizeBar:true
                        }),
                        isc.VLayout.create({
                            members:[
                                this.copyUserTargetForm,
                                this.copyTargetUserUI
                            ]
                        })
                    ]
                })
            ];
        }
        var roleNames=this.getRolesForUser(this.selectedUsers[0]),
            allRoles=this.rolesGrid.data.getRange(0,this.rolesGrid.data.getLength()),
            sourceRoles=allRoles.findAll("name",roleNames);
        this.copyUserSourceGrid.setData(sourceRoles);
        this.copyUserRolesWindow.show();
    }
,isc.A.updateSelectedTargetUsers=function isc_DeploymentUsersAndRolesEditor_updateSelectedTargetUsers(userIds){
        if(userIds&&userIds.length>0){
            var targetUsersFetchID=++this.targetUsersFetchID;
            this.getUsersDS().fetchData(
                {userId:userIds},
                {target:this,methodName:"_fetchTargetUsersByIdReply"},
                {clientContext:{targetUsersFetchID:targetUsersFetchID}}
            );
        }else{
            this.copyUserTargetGrid.setSelectedUsers([]);
            if(this.copyTargetUserUI.isVisible()){
                this.copyTargetUserUI.hide();
            }
        }
    }
,isc.A._fetchTargetUsersByIdReply=function isc_DeploymentUsersAndRolesEditor__fetchTargetUsersByIdReply(dsResponse,data,dsRequest){
        if(dsResponse.clientContext.targetUsersFetchID!=this.targetUsersFetchID)return;
        if(data&&data.length>0){
            this.copyUserTargetGrid.setSelectedUsers(data.duplicate());
            if(!this.copyTargetUserUI.isVisible()){
                this.copyTargetUserUI.show();
            }
        }
    }
,isc.A.copyUserRoles=function isc_DeploymentUsersAndRolesEditor_copyUserRoles(){
        var targetUsers=this.copyUserTargetGrid._selectedUsers;
        if(!targetUsers||targetUsers.length==0){
            this.copyUserRolesWindow.clear();
            return;
        }
        var sourceUser=this.selectedUsers[0],
            sourceRoles=this.getRolesForUser(sourceUser),
            losingRoles=false;
        for(var i=0;i<targetUsers.length;i++){
            var targetUser=targetUsers[i],
                currentRoles=this.getRolesForUser(targetUser);
            if(currentRoles){
                if(sourceRoles.length<currentRoles.length){
                    losingRoles=true;
                }else{
                    for(var ii=0;ii<currentRoles.length;ii++){
                        if(sourceRoles.indexOf(currentRoles[ii])==-1){
                            losingRoles=true;
                            break;
                        }
                    }
                }
            }
            if(losingRoles)break;
        }
        if(losingRoles){
            if(this.copyWillRemoveDialog==null){
                this.copyWillRemoveDialog=this.createAutoChild(
                    "copyWillRemoveDialog",
                    {message:this.copyWillRemoveWarning}
                );
            }
            this.copyWillRemoveDialog.sourceRoles=sourceRoles;
            this.copyWillRemoveDialog.show();
        }else{
            this.applyRolesToUsers(sourceRoles);
        }
    }
,isc.A.applyRolesToUsers=function isc_DeploymentUsersAndRolesEditor_applyRolesToUsers(roles,addToExisting){
        var targetUsers=this.copyUserTargetGrid._selectedUsers;
        if(!targetUsers||targetUsers.length==0||
            (addToExisting&&(roles==null||roles.length==0)))
        {
            this.copyUserRolesComplete();
            return;
        }
        var updatedUserRecords=[];
        for(var i=0;i<targetUsers.length;i++){
            var targetUser=targetUsers[i],
                currentRoles=targetUser.roles,
                rolesForUser=roles==null?roles:roles.duplicate();
            var rolesHaveChanged=false;
            if(addToExisting&&targetUser.roles!=null){
                for(var ii=0;ii<currentRoles.length;ii++){
                    if(!rolesForUser.contains(currentRoles[ii])){
                        rolesForUser.add(currentRoles[ii]);
                    }
                }
            }
            var wasEmpty=currentRoles==null||currentRoles.length==0,
                isEmpty=rolesForUser==null||rolesForUser.length==0;
            if(wasEmpty&&isEmpty)continue;
            if(wasEmpty||isEmpty||(currentRoles.length!=rolesForUser.length)){
                rolesHaveChanged=true;
            }else{
                for(var ii=0;ii<currentRoles.length;ii++){
                    if(!rolesForUser.contains(currentRoles[ii])){
                        rolesHaveChanged=true;
                        break;
                    }
                }
            }
            if(rolesHaveChanged){
                targetUser.roles=rolesForUser;
                updatedUserRecords.add(targetUser);
            }
        }
        if(updatedUserRecords.length>0){
            var wasQueuing=isc.RPCManager.startQueue();
            for(var i=0;i<updatedUserRecords.length;i++){
                var callback=
                    (i==updatedUserRecords.length-1)?
                        {target:this,methodName:"copyUserRolesComplete"}:null;
                this.getUsersDS().updateData(
                    updatedUserRecords[i],callback
                );
            }
            if(!wasQueuing)isc.RPCManager.sendQueue();
        }else{
            this.copyUserRolesComplete();
        }
    }
,isc.A.copyUserRolesComplete=function isc_DeploymentUsersAndRolesEditor_copyUserRolesComplete(){
        this.copyUserRolesWindow.clear();
    }
);
isc.B._maxIndex=isc.C+33;

isc.defineClass("DeploymentDSNavigator","DataSourceNavigator");
isc.A=isc.DeploymentDSNavigator.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.dsEnumerationSectionItems=["autoChild:dsEnumerationGrid"];
isc.A.dsEnumerationGridDefaults={
        initialCriteria:null
    };
isc.A.dataSourceNavigatorDSDefaults={
        dataSourcesDS:"isc_hostedDataSources",
        dataProtocol:null,
        transformRequest:function(request){
            return request.data;
        },
        cacheConvertedRecords:function(serverDSRecords){
            var cache=[];
            for(var i=0;i<serverDSRecords.length;i++){
                var serverRecord=serverDSRecords[i];
                var cacheRecord={
                    datasourceId:serverRecord.fileName,
                    serverType:serverRecord.fileType,
                    dataFormat:serverRecord.fileFormat||"iscServer",
                    usesSCServerProtocol:true,
                    status:"loaded",
                    clientOnly:true
                };
                this.inferTypeValue(cacheRecord);
                cache.add(cacheRecord);
            };
            this.setCacheData(cache);
            this.updateCaches({dataSource:this,invalidateCache:true});
        },
        init:function(){
            this.Super("init",arguments);
            var localDS=this,
                nav=localDS.creator,
                deploymentId=nav.deploymentId
            ;
            isc.DS.getDeploymentDS(this.dataSourcesDS,deploymentId,function(dataSourcesDS){
                dataSourcesDS.listFiles(null,function(response,data,request){
                    if(data==null){
                        localDS.logWarn("Unable to get deployed DataSources from DS: "+
                                        localDS.dataSourcesDS);
                    }else{
                        localDS.cacheConvertedRecords(response.data);
                    }
                },{operationId:"allOwners"});
            });
        }
    }
;
isc.B.push(isc.A.invalidateCache=function isc_DeploymentDSNavigator_invalidateCache(){
    }
,isc.A.fetchAllDataSources=function isc_DeploymentDSNavigator_fetchAllDataSources(){
    }
,isc.A.useDataSourceObject=function isc_DeploymentDSNavigator_useDataSourceObject(id,func,sandbox){
        if(!sandbox)return this.Super("useDataSourceObject",arguments);
        isc.DataSource.getDeploymentDS(id,this.deploymentId,func,true);
    }
,isc.A.getShortDSId=function isc_DeploymentDSNavigator_getShortDSId(ds){
        return ds?ds.getShortId():null;
    }
);
isc.B._maxIndex=isc.C+4;

isc.defineClass("DeploymentUsageViewer","SectionStack");
isc.A=isc.DeploymentUsageViewer.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.overflow="auto";
isc.A.visibilityMode="multiple";
isc.A.sessionsDataSource="isc_hostedSessions";
isc.A.dataSourcesDataSource="isc_hostedDataSources";
isc.A.dataSourcesDataBase="reify";
isc.A.sessionsOverviewGridTitle="Deployment Sessions";
isc.A.sessionsOverviewGridConstructor="ListGrid";
isc.A.sessionsOverviewGridDefaults={
        width:"100%",
        sortField:"id",
        sortDirection:"descending",
        showFilterEditor:true,
        selectionType:"single",
        initialSessionsCriteria:{
            _constructor:"AdvancedCriteria",
            operator:"and",
            criteria:[{
                fieldName:"startTime",
                operator:"greaterThan",
                value:isc.DateUtil.dateAdd(new Date(),"d",3,-1)
            }]
        },
        rowClick:function(record){
            this.viewer.addSessionAuditSection(record);
        },
        datetimeFormatter:"MM/dd/YYYY HH:mm:ss",
        useAllDataSourceFIelds:true,
        fields:[{
            name:"userId"
        },{
            name:"isActive",title:"Is Active?",width:85,
            type:"boolean",userFormula:{text:"record.endTime == null"}
        },{
            name:"startTime",width:115,align:"left"
        },{
            name:"endTime",width:115,align:"left"
        },{
            name:"lastActivityTime",width:115,align:"left"
        }],
        initWidget:function(){
            this.Super("initWidget",arguments);
            var that=this,
                viewer=this.viewer,
                dsId=viewer.sessionsDataSource,
                deploymentId=viewer.deploymentId
            ;
            isc.DS.getDeploymentDS(dsId,deploymentId,function(sandboxedDS){
                that.setDataSource(sandboxedDS,that.fields);
                that.fetchData(that.initialSessionsCriteria);
            });
        }
    };
isc.A.refreshButtonConstructor=isc.ToolStripButton;
isc.A.refreshButtonDefaults={
        title:"Refresh",
        showDisabledIcon:false,
        icon:"[SKINIMG]/headerIcons/refresh.png",
        click:function(){
            var viewer=this.creator;
            viewer.sessionsOverviewGrid.invalidateCache();
            viewer._asyncRefreshAuditGrids();
        }
    };
isc.A._asyncGridRefreshDelay=100;
isc.A.sessionAuditPickerTitle="Changes by user ${userId} during session:";
isc.A.sessionAuditPickerLabelConstructor="Label";
isc.A.sessionAuditPickerLabelDefaults={
        wrap:false,baseStyle:"sessionAuditSectionTitle"
    };
isc.A.sessionAuditPickerFormConstructor="DeploymentSessionPickerForm";
isc.A.closeButtonConstructor=isc.ImgButton;
isc.A.closeButtonDefaults={
        autoDraw:false,src:"[SKIN]actions/close.png",size:16,
        showFocused:false,showRollOver:false,showDown:false
    };
isc.A.sessionAuditGridConstructor="DeploymentSessionAuditGrid";
isc.B.push(isc.A._asyncRefreshAuditGrids=function isc_DeploymentUsageViewer__asyncRefreshAuditGrids(){
        var sections=this.sections,
            grids=this._gridsToRefresh=[];
        for(var i=sections.length-1;i>0;i--){
            grids.add(sections[i].items[0]);
        }
        if(!grids.length)return;
        this.refreshButton.setDisabled(true);
        this.delayCall("_refreshNextAuditGrid",[],this._asyncGridRefreshDelay);
    }
,isc.A._refreshNextAuditGrid=function isc_DeploymentUsageViewer__refreshNextAuditGrid(){
        var grids=this._gridsToRefresh;
        var grid=grids.pop();
        if(!grid.destroying&&!grid.destroyed)grid.refreshAuditData();
        if(!grids.length)this.refreshButton.setDisabled(false);
        else{
            this.delayCall("_refreshNextAuditGrid",[],this._asyncGridRefreshDelay);
        }
    }
,isc.A.initWidget=function isc_DeploymentUsageViewer_initWidget(){
        this.Super("initWidget",arguments);
        this.sessionsOverviewGrid=this.createAutoChild("sessionsOverviewGrid",{
            viewer:this
        });
        this.refreshButton=this.createAutoChild("refreshButton");
        this.addSection({
            title:this.sessionsOverviewGridTitle,expanded:true,
            items:[this.sessionsOverviewGrid],
            controls:[this.refreshButton]
        });
        var viewer=this,
            deploymentId=viewer.deploymentId
        ;
        isc.DS.getDeploymentDS(this.dataSourcesDataSource,deploymentId,function(sandboxedDS){
            viewer.loadAuditDataSources(sandboxedDS);
        });
    }
,isc.A.getDSNavigatorStack=function isc_DeploymentUsageViewer_getDSNavigatorStack(){
        var manager=this.creator,
            dataPane=manager.dataPane;
        return dataPane.dsNavigatorStack;
    }
,isc.A.loadAuditDataSources=function isc_DeploymentUsageViewer_loadAuditDataSources(dataSourcesDS){
        var viewer=this;
        dataSourcesDS.listFiles(null,function(response,dataSourceRecords){
            if(dataSourceRecords==null){
                viewer.logWarn("unable to load list of deployed DataSources from "+
                               dataSourcesDS.getShortId());
                return;
            }
            var allDataSourceNames=[];
            for(var i=0;i<dataSourceRecords.length;i++){
                var dataSourceRecord=dataSourceRecords[i];
                allDataSourceNames.add(dataSourceRecord.fileName);
            }
            isc.DS.loadDeploymentDS(allDataSourceNames,viewer.deploymentId,function(allDS){
                var allDSes={};
                for(var i=0;i<allDS.length;i++){
                    var ds=allDS[i];
                    allDSes[ds.getShortId()]=ds;
                }
                var auditDSes=viewer.auditDataSources={};
                for(var i=0;i<allDS.length;i++){
                    var ds=allDS[i];
                    if(!ds.audit)continue;
                    var auditDSId=ds.getAuditDataSourceID();
                    auditDSes[ds.getShortId()]=allDSes[auditDSId];
                }
                if(viewer.logIsInfoEnabled()){
                    viewer.logInfo("loaded "+auditDSes.length+" audit DataSources");
                }
            });
        },{operationId:"allOwners"});
    }
,isc.A.addSessionAuditSection=function isc_DeploymentUsageViewer_addSessionAuditSection(session){
        var sectionId="audit"+session.id;
        if(this.getSection(sectionId)!=null)return;
        var id=session.id,
            userId=session.userId,
            grid=this.sessionsOverviewGrid
        ;
        var pickerTitle=this.sessionAuditPickerTitle.evalDynamicString(this,{
                userId:userId
            }),
            pickerCrit={
                _constructor:"AdvancedCriteria",operator:"and",
                criteria:[{
                    fieldName:"userId",operator:"equals",value:userId
                },{
                    fieldName:"id",operator:"lessOrEqual",value:id
                }]
            }
        ;
        var form=this.createAutoChild("sessionAuditPickerForm",{
            items:[{
                name:"id",width:"100%",
                editorType:"SelectItem",
                multiple:true,showTitle:false,
                pickListProperties:{
                    drawAllMaxCells:20
                },
                defaultToFirstOption:true,
                pickListCriteria:pickerCrit,
                optionDataSource:grid.dataSource,
                optionFilterContext:{sortBy:["-id"]},
                pickListConstructor:"DeploymentSessionPickList",
                formatValue:function(value){
                    var pickList=this.pickList;
                    if(!pickList||value==null)return null;
                    var record=pickList.find({id:value});
                    return pickList.formatCellValue(value,record);
                }
            }]
        });
        var stack=this,
            controls=[
                isc.LayoutSpacer.create({width:21}),
                this.createAutoChild("sessionAuditPickerLabel",{
                    contents:pickerTitle+" "
                }),
                form,
                this.createAutoChild("closeButton",{
                    click:function(){
                        stack.removeSection(sectionId);
                        stack.expandSection(0);
                    }
                })
            ]
        ;
        this.addSection({
            title:null,
            name:sectionId,
            expanded:true,
            controlsLayoutProperties:{
                _constructor:"HLayout",
                height:1,width:"100%",
                draw:function(){
                    this.Super("draw",arguments);
                    this.setEventProxy(this.parentElement);
                }
            },
            controls:controls,
            items:[
                this.createAutoChild("sessionAuditGrid",{
                    viewer:this,form:form,session:session,
                    allAuditId:"_allAudit"+id
                })
            ]
        },1);
    }
);
isc.B._maxIndex=isc.C+6;

isc.defineClass("DeploymentSessionPickList","PickListMenu");
isc.A=isc.DeploymentSessionPickList.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.autoFitData="vertical";
isc.A.autoFitMaxRecords=10;
isc.A.bodyOverflow="hidden";
isc.A.drawAheadRatio=1;
isc.A.dataPageSize=10;
isc.B.push(isc.A.getCellAlign=function isc_DeploymentSessionPickList_getCellAlign(){
        return"left";
    }
,isc.A.formatCellValue=function isc_DeploymentSessionPickList_formatCellValue(value,record){
        return record==null?null:isc.DeploymentUsageViewer.
            formatSessionInterval(record.startTime,record.endTime);
    }
);
isc.B._maxIndex=isc.C+2;

isc.defineClass("DeploymentSessionAuditGrid","ListGrid");
isc.A=isc.DeploymentSessionAuditGrid.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.showFilterEditor=true;
isc.A.autoFetchData=false;
isc.A.showClippedValuesOnHover=true;
isc.A.sortField="changeTime";
isc.A.sortDirection="descending";
isc.A.relatedDataFieldPrompt="Click to see related audit data";
isc.A.relatedDataMenuInfoText="Jump to <b>Data</b> tab and view...";
isc.A.relatedDataMenuRecordText="Changes to this <b>record</b> by <b>any user</b>";
isc.A.relatedDataMenuDataSourceText="Changes to DataSource <b>${dsId}</b> by <b>any user</b>";
isc.A.relatedDataMenuConstructor="Menu";
isc.A.relatedDataMenuDefaults={
        autoDraw:false
    };
isc.A.defaultFields=[{
        name:"dataSourceId",title:"DataSource ID",type:"text",width:100
    },{
        name:"auditRevision",hidden:true,canHide:false,type:"integer"
    },{
        name:"changeTime",title:"Change Time",type:"datetime",width:100
    },{
        name:"operation",title:"Operation",type:"text",width:80
    },{
        name:"changeSummary",title:"Summary of Changes",type:"text"
    },{
        name:"relatedData",showTitle:false,type:"icon",showHover:true,
        cellIcon:"../graphics/actions/relatedData.png",
        recordClick:function(grid,record,recordNum){
            var menu=grid.relatedDataMenu;
            if(!menu){
                menu=grid.relatedDataMenu=grid.createAutoChild("relatedDataMenu");
            }
            menu.setData([{
                title:grid.relatedDataMenuInfoText,enabled:false
            },{
                title:grid.relatedDataMenuRecordText,
                action:function(){
                    grid.addDSSectionToDataPane(record,true);
                }
            },{
                title:grid.relatedDataMenuDataSourceText.evalDynamicString(grid,{
                    dsId:record.dataSourceId
                }),
                action:function(){
                    grid.addDSSectionToDataPane(record);
                }
            }]);
            menu.showContextMenu();
        }
    }];
isc.A.relatedDataTargetLength=200;
isc.A.relatedDataMinLength=10;
isc.A.relatedDataMaxLength=1000;
isc.A.maxRelatedDataFetches=3;
isc.A.maxOffsetRatio=20;
isc.A.defaultDataSourceOffset=86400;
isc.A.defaultSingleRecordOffset=10*86400;
isc.A._summarySeparator=", ";
isc.A.fetchAuditDataTransaction=0;
isc.B.push(isc.A.addDSSectionToDataPane=function isc_DeploymentSessionAuditGrid_addDSSectionToDataPane(record,forRecord){
        var viewer=this.viewer,
            dsId=record.dataSourceId,
            deploymentId=viewer.deploymentId,
            ds=isc.DS.getDeploymentDS(dsId,deploymentId)
        ;
        var sentinel,keysObj,offset;
        if(forRecord){
            sentinel=record;
            offset=this.defaultSingleRecordOffset;
            keysObj=record.keysObj;
        }else{
            sentinel=ds;
            offset=this.defaultDataSourceOffset;
            keysObj=null;
        }
        if(sentinel._relatedDataInProgress){
            if(this.logIsInfoEnabled()){
                this.logInfo("skipping search for related audit data for "+
                             this._getRelatedDataContextMessage(dsId,keysObj)+
                             " as one is already in progress");
            }
            return;
        }
        sentinel._relatedDataInProgress=true;
        var dsMap=viewer.auditDataSources,
            auditDS=dsMap[ds.getShortId()],
            idField=ds.getAuditRevisionFieldName(),
            timeField=ds.getAuditTimeStampFieldName()
        ;
        var context={
            sentinel:sentinel,
            offset:offset*1000,
            record:record,
            keysObj:keysObj,
            auditedDS:ds,
            auditDS:auditDS,
            idField:idField,
            timeField:timeField,
            results:[]
        };
        this._fetchRelatedData(context);
    }
,isc.A._fetchRelatedData=function isc_DeploymentSessionAuditGrid__fetchRelatedData(context){
        var record=context.record,
            offset=context.offset,
            auditedDS=context.auditedDS,
            timeField=context.timeField,
            recordTime=record.changeTime,
            recordMillis=recordTime.getTime()
        ;
        var timeCrit=context.timeCrit={
            _constructor:"AdvancedCriteria",
            operator:"and",
            criteria:[{
                fieldName:timeField,operator:"greaterOrEqual",
                value:new Date(recordMillis-offset)
            },{
                fieldName:timeField,operator:"lessOrEqual",
                value:new Date(recordMillis+offset)
            }]
        };
        var that=this,
            keysObj=context.keysObj,
            auditDS=context.auditDS,
            idField=context.idField
        ;
        auditDS.fetchData(isc.DS.combineCriteria(timeCrit,keysObj),
            function(response,data,request){
                that._handleFetchRelatedDataReply(response,data,request,context);
            },{sortBy:"-"+idField}
        );
    }
,isc.A._handleFetchRelatedDataReply=function isc_DeploymentSessionAuditGrid__handleFetchRelatedDataReply(response,data,request,context){
        var viewer=this.viewer,
            record=context.record,
            keysObj=context.keysObj,
            sentinel=context.sentinel,
            auditedDS=context.auditedDS
        ;
        if(response.status<0){
            this.logWarn("unable to fetch related audit data for "+
                this._getRelatedDataContextMessage(auditedDS.getID(),keysObj)+
                " due to response status "+response.status);
            sentinel._relatedDataInProgress=null;
            return;
        }
        var length=data.length,
            results=context.results,
            idField=context.idField,
            revision=record.auditRevision,
            index=data.findIndex(idField,revision)
        ;
        results.add({
            crit:context.timeCrit,
            length:length,
            index:index
        });
        var bestResult,
            lengthMin=this.relatedDataMinLength,
            lengthMax=this.relatedDataMaxLength
        ;
        if(length>=lengthMin&&length<=lengthMax){
            bestResult=results.last();
        }else if(results.length>=this.maxRelatedDataFetches){
            var bestRatio;
            for(var i=0;i<results.length;i++){
                var resultLength=results[i].length,
                    resultRatio=resultLength>lengthMax?resultLength/lengthMax:
                                                             lengthMin/resultLength;
                if(bestRatio==null||resultRatio<bestRatio){
                    bestRatio=resultRatio;
                    bestResult=results[i];
                }
            }
        }else{
            var correctionFactor=Math.min(this.maxOffsetRatio,
                                            this.relatedDataTargetLength/length);
            context.offset=Math.ceil(context.offset*correctionFactor);
            this._fetchRelatedData(context);
            return;
        }
        sentinel._relatedDataInProgress=null;
        var timeCrit=bestResult.crit,
            dsStack=viewer.getDSNavigatorStack(),
            grid=dsStack.addDataSourceSection(context.auditDS,auditedDS,keysObj,timeCrit)
        ;
        var that=this;
        this.observe(grid,"dataArrived",function(startRow,endRow){
            if(index>=startRow&&index<endRow){
                grid.selectRecord(index);
                that.ignore(grid,"dataArrived");
            }
        });
        grid.scrollToRow(index);
        var manager=viewer.creator;
        manager.selectTab("data");
    }
,isc.A._getRelatedDataContextMessage=function isc_DeploymentSessionAuditGrid__getRelatedDataContextMessage(dsId,keysObj){
        var message=keysObj?"record "+isc.echo(keysObj)+" in ":"";
        return"DataSource "+dsId;
    }
,isc.A.initWidget=function isc_DeploymentSessionAuditGrid_initWidget(){
        this.dataSource=isc.DataSource.create({
            ID:this.allAuditId,fields:this.defaultFields,clientOnly:true
        });
        this.Super("initWidget",arguments);
        this.setFieldProperties("relatedData",{
            cellPrompt:this.relatedDataFieldPrompt
        });
        var idItem=this.form.getItem("id");
        this.observe(idItem,"changed","observer.fetchAuditData()");
        this.observe(idItem,"setValue","observer.fetchAuditData()");
        this.observe(idItem,"handleDataArrived","observer.fetchAuditData()");
    }
,isc.A._flattenSummary=function isc_DeploymentSessionAuditGrid__flattenSummary(summaryObj){
        var separator=this._summarySeparator,
            summary=isc.emptyString,
            first=summaryObj.first,
            main=summaryObj.main,
            last=summaryObj.last
        ;
        if(first)summary=first.join(separator);
        if(main){
            if(summary)summary+=separator;
            summary+=main.join(separator);
        }
        if(last){
            if(summary)summary+=separator;
            summary+=last.join(separator);
        }
        return summary;
    }
,isc.A._getFirstFields=function isc_DeploymentSessionAuditGrid__getFirstFields(ds){
        var first=[ds.getTitleField()];
        if(ds.dataField)first.add(ds.dataField);
        if(ds.infoField)first.add(ds.infoField);
        return first;
    }
,isc.A._buildAllAuditDataSource=function isc_DeploymentSessionAuditGrid__buildAllAuditDataSource(responses){
        var ds,auditData=[],
            threshold=this.longTextEditorThreshold,
            comparator=function(a,b){
                var fields=ds.fields;
                return fields[a]._fieldOrderIndex-fields[b]._fieldOrderIndex;
            }
        ;
        for(var i=0;i<responses.length;i++){
            var response=responses[i],
                context=response.clientContext
            ;
            ds=context.auditedDS;
            if(response.status<0){
                this.logWarn("fetchAuditData(): unable to retrieve audit data for DS "+
                             ds.getID());
                continue;
            }
            var fields=ds.getFields(),
                firstFields=this._getFirstFields(ds)
            ;
            if(!ds._fieldsIndexed)ds._indexFields();
            var typeField=ds.getAuditTypeFieldName(),
                timeStampField=ds.getAuditTimeStampFieldName(),
                changedFieldsField=ds.getAuditChangedFieldsFieldName(),
                auditRevisionField=ds.getAuditRevisionFieldName()
            ;
            var responseData=response.data||[];
            for(var j=0;j<responseData.length;j++){
                var summary=null,
                    record=responseData[j],
                    changeType=record[typeField];
                switch(changeType){
                case"add":
                    summary={};
                    for(var fieldName in fields){
                        if(record[fieldName]==null)continue;
                        this._addFieldToChangeSummary(record,fieldName,ds,firstFields,
                                                      summary);
                    }
                    break;
                case"update":
                    var summary={},
                        changedFields=record[changedFieldsField];
                    if(changedFields){
                        if(changedFields.length>1)changedFields.sort(comparator);
                        for(var k=0;k<changedFields.length;k++){
                            var fieldName=changedFields[k];
                            this._addFieldToChangeSummary(record,fieldName,ds,firstFields,
                                                          summary);
                        }
                    }
                    break;
                case"remove":
                default:
                    break;
                }
                if(summary)summary=this._flattenSummary(summary);
                auditData.add({dataSourceId:ds.getShortId(),
                               changeTime:record[timeStampField],
                               auditRevision:record[auditRevisionField],
                               keysObj:ds.filterPrimaryKeyFields(record),
                               operation:changeType,changeSummary:summary});
            }
        }
        this._setAuditCacheData(auditData);
    }
,isc.A._setAuditCacheData=function isc_DeploymentSessionAuditGrid__setAuditCacheData(newData){
        var oldData=this.dataSource.cacheData;
        if(oldData&&oldData.length||newData&&newData.length){
            this.dataSource.setCacheData(newData);
        }else return;
        if(this.willFetchData())this.fetchData();
        else this.invalidateCache();
    }
,isc.A._addFieldToChangeSummary=function isc_DeploymentSessionAuditGrid__addFieldToChangeSummary(record,fieldName,ds,firstFields,summary){
        var formattedValue=ds.formatFieldValue(fieldName,record[fieldName]),
            bindingSummary=fieldName+" -> "+formattedValue
        ;
        var firstIndex=firstFields.indexOf(fieldName);
        if(firstIndex>=0){
            var first=summary.first;
            if(!first)first=summary.first=[];
            first[firstIndex]=bindingSummary;
            return;
        }
        if(isc.isA.String(formattedValue)&&
            formattedValue.length>this.longTextEditorThreshold)
        {
            var last=summary.last;
            if(!last)last=summary.last=[];
            last.add(bindingSummary);
        }
        var main=summary.main;
        if(!main)main=summary.main=[];
        main.add(bindingSummary);
    }
,isc.A.fetchAuditData=function isc_DeploymentSessionAuditGrid_fetchAuditData(){
        var grid=this,
            viewer=this.viewer,
            dsMap=viewer.auditDataSources,
            picker=this.form.getItem("id"),
            deploymentId=viewer.deploymentId
        ;
        var lastIntervalIds=this._lastIntervalIds;
        this._lastIntervalIds=picker.getValue();
        if(isc.Canvas.compareValues(lastIntervalIds,this._lastIntervalIds))return;
        var auditUserField="audit_modifier",
            auditTimeStampField="audit_changeTime",
            criteria=this.form.getAuditCriteria(auditUserField,auditTimeStampField);
        if(!criteria){
            this._setAuditCacheData();
            return;
        }
        var transactionNum=++this.fetchAuditDataTransaction;
        isc.RPCManager.startQueue();
        var origEmptyMessage=this.emptyMessage;
        this.setEmptyMessage(this.loadingDataMessage);
        for(var dsId in dsMap){
            var ds=isc.DataSource.getDeploymentDS(dsId,deploymentId);
            dsMap[dsId].fetchData(criteria,null,{clientContext:{auditedDS:ds}});
        }
        isc.RPCManager.sendQueue(function(responses){
            if(transactionNum==grid.fetchAuditDataTransaction){
                grid.setEmptyMessage(origEmptyMessage);
                grid._buildAllAuditDataSource(responses);
            }
        });
    }
,isc.A.refreshAuditData=function isc_DeploymentSessionAuditGrid_refreshAuditData(){
        var form=this.form;
        if(form.hasActiveSessions()){
            delete this._lastIntervalIds;
            form.invalidatePickListCache();
        }
    }
);
isc.B._maxIndex=isc.C+12;

isc.defineClass("DeploymentSessionPickerForm","DynamicForm");
isc.A=isc.DeploymentSessionPickerForm.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.width="100%";
isc.A.numCols=1;
isc.A.overflow="clip-h";
isc.A.wrapItemTitles=false;
isc.B.push(isc.A.getAuditCriteria=function isc_DeploymentSessionPickerForm_getAuditCriteria(userFieldName,timeStampFieldName){
        var idItem=this.getItem("id"),
            sessions=idItem.getValue(),
            pickList=idItem.pickList
        ;
        if(!sessions||!pickList)return null;
        var userId,intervalCrit=[];
        for(var i=0;i<sessions.length;i++){
            var session=pickList.find({id:sessions[i]});
            if(!session)continue;
            if(!userId)userId=session.userId;
            var startTime=session.startTime,
                endTime=session.endTime
            ;
            var crit=endTime?{
                fieldName:timeStampFieldName,
                operator:"iBetweenInclusive",
                start:startTime,end:endTime
            }:{
                fieldName:timeStampFieldName,
                operator:"greaterOrEqual",
                value:startTime
            };
            intervalCrit.add(crit);
        }
        if(!intervalCrit.length)return null;
        return{
            _constructor:"AdvancedCriteria",operator:"and",
            criteria:[{
                fieldName:userFieldName,operator:"equals",value:userId
            },{
                operator:"or",criteria:intervalCrit
            }]
        };
    }
,isc.A.hasActiveSessions=function isc_DeploymentSessionPickerForm_hasActiveSessions(){
        var idItem=this.getItem("id"),
            pickList=idItem.pickList;
        return pickList&&!!pickList.find({endTime:null});
    }
,isc.A.invalidatePickListCache=function isc_DeploymentSessionPickerForm_invalidatePickListCache(){
        var idItem=this.getItem("id"),
            pickList=idItem.pickList;
        if(pickList)pickList.invalidateCache();
    }
);
isc.B._maxIndex=isc.C+3;

isc.A=isc.DeploymentUsageViewer;
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.B.push(isc.A.formatSessionInterval=function isc_c_DeploymentUsageViewer_formatSessionInterval(startTime,endTime){
        if(startTime==null)return null;
        var DateUtil=isc.DateUtil;
        if(endTime==null){
            return DateUtil.format(startTime,"dddd MMMM d h:mma")+" - present";
        }
        var startYear=startTime.getFullYear(),
            startMonth=startTime.getMonth(),
            startDate=startTime.getDate()
        ;
        var endYear=endTime.getFullYear(),
            endMonth=endTime.getMonth(),
            endDate=endTime.getDate()
        ;
        if(startYear==endYear&&startMonth==endMonth){
            if(startDate==endDate){
                return DateUtil.format(startTime,"dddd MMMM d h:mma - ")+
                       DateUtil.format(endTime,"h:mma");
            }
            if(endDate-startDate==1){
                return DateUtil.format(startTime,"dddd MMMM d-")+endDate+
                       DateUtil.format(startTime," h:mma - ")+
                       DateUtil.format(endTime,"h:mma");
            }
        }else if(startYear==endYear){
            if(endMonth-startMonth==1&&endDate==1){
                var tempDate=new Date(endTime);
                tempDate.setDate(0);
                if(tempDate.getDate()==startDate){
                    return DateUtil.format(startTime,"dddd MMMM d - ")+
                           DateUtil.format(endTime,"MMMM d ")+
                           DateUtil.format(startTime,"h:mma - ")+
                           DateUtil.format(endTime,"h:mma");
                }
            }
        }else if(endYear-startYear==1&&
                   endMonth==0&&startMonth==11&&
                   endDate==1&&startDate==31)
        {
            return DateUtil.format(startTime,"dddd MMMM d yyyy - ")+
                   DateUtil.format(endTime,"MMMM d yyyy ")+
                   DateUtil.format(startTime,"h:mma - ")+
                   DateUtil.format(endTime,"h:mma");
        }
        if(endYear==startYear){
            return DateUtil.format(startTime,"dddd MMMM d h:mma - ")+
                   DateUtil.format(endTime,"dddd MMMM d h:mma");
        }else{
            return DateUtil.format(startTime,"dddd MMMM d h:mma yyyy - ")+
                   DateUtil.format(endTime,"dddd MMMM d h:mma yyyy");
        }
    }
);
isc.B._maxIndex=isc.C+1;

isc.defineClass("DSDashboard","HLayout");
isc.A=isc.DSDashboard.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.membersMargin=20;
isc.A.selectorDashboardsTabTitle="Dashboards";
isc.A.selectorPaletteTabTitle="Palette";
isc.A.newDashboardDescription="New Dashboard";
isc.A.cloneDashboardDescriptionSuffix="Copy";
isc.A.paletteDataSourceNameField="dsName";
isc.A.dataSource="dashboards";
isc.A.descriptionField="description";
isc.A.layoutField="layout";
isc.A.initialPortalPaletteNode={
        type:"PortalLayout",
        defaults:{
            width:"100%",
            height:"100%",
            canResizePortlets:true
        }
    };
isc.A.dashboardsConstructor=isc.ListGrid;
isc.A.dashboardsDefaults={
        autoParent:"dashboardsLayout",
        autoFetchData:true,
        selectionType:"single",
        canEdit:true,
        canRemoveRecords:true,
        initWidget:function(){
            this.sortField=this.dashboardDescriptionField;
            this.fields=[{name:this.dashboardDescriptionField}];
            this.Super("initWidget",arguments);
        },
        clearCurrentDashboard:function(){
            this.getEditPane().destroyAll();
            this.getEditPane().hide();
            this.getEditToolbar().hide();
        },
        editDashboard:function(){
            var record=this.getSelectedRecord();
            if(record){
                var layout=record[this.dashboardLayoutField];
                this.getEditPane().addPaletteNodesFromXML(layout);
                this.getEditPane().show();
                this.getEditToolbar().show();
                this.showPalette();
            }
            this._currentRecord=record;
        },
        viewDashboard:function(layout){
            var record=this.getSelectedRecord();
            if(record){
                var layout=record[this.dashboardLayoutField];
                this.getEditPane().addPaletteNodesFromXML(layout);
                this.getEditPane().show();
                this.getEditToolbar().hide();
                this.hidePalette();
            }
            this._currentRecord=record;
        },
        newDashboard:function(){
            this.clearCurrentDashboard();
            this._currentRecord=null;
            this.getEditPane().addFromPaletteNode(this.initialPortalPaletteNode);
            this.getEditPane().show();
            this.getEditToolbar().show();
            this.showPalette();
            this.saveDashboard();
        },
        cloneDashboard:function(layout){
            var record=this.getSelectedRecord();
            if(record){
                this.cloneRecord(record);
            }
        },
        showPalette:function(){
            this.getSelector().enableTab(1);
            this.getSelector().selectTab(1);
        },
        hidePalette:function(){
            this.getSelector().disableTab(1);
            this.getSelector().selectTab(0);
        },
        refreshDashboard:function(){
            this.clearCurrentDashboard();
            this.editDashboard();
        },
        saveDashboard:function(){
            var editNodes=this.getEditPane().serializeAllEditNodes({indent:false});
            if(this._currentRecord){
                this._currentRecord[this.dashboardLayoutField]=editNodes;
                this.updateData(this._currentRecord);
            }else{
                var grid=this,
                    record={}
                ;
                record[this.dashboardDescriptionField]=this.newDashboardDescription;
                record[this.dashboardLayoutField]=editNodes;
                this.addData(record,function(response,data,request){
                    if(data&&!isc.isAn.Array(data)){
                        data=[data];
                    }
                    if(data&&data.length>0){
                        grid.selectSingleRecord(data[0]);
                        grid._currentRecord=data[0];
                    }
                });
            }
        },
        cloneRecord:function(record,copyNum){
            if(!copyNum)copyNum=1;
            if(copyNum>100){
                return;
            }
            var grid=this,
                ds=this.getDataSource(),
                cloneDesc=record[this.dashboardDescriptionField]+" "+this.cloneDashboardDescriptionSuffix+" "+copyNum,
                matchRecord={}
            ;
            matchRecord[this.dashboardDescriptionField]=cloneDesc;
            ds.fetchData(matchRecord,function(response,data,request){
                if(data&&data.length>0){
                    this.cloneRecord(record,copyNum);
                    return;
                }
                var newRecord={};
                newRecord[grid.dashboardDescriptionField]=cloneDesc;
                newRecord[grid.dashboardLayoutField]=record[grid.dashboardLayoutField];
                grid.addData(newRecord,function(response,data,request){
                    if(data&&data.length>0){
                        grid.selectSingleRecord(data[0]);
                    }
                });
            });
        },
        getEditPane:function(){
            return this.creator.editPane;
        },
        getEditToolbar:function(){
            return this.creator.editToolbar;
        },
        getSelector:function(){
            return this.creator.selector;
        }
    };
isc.A.viewButtonConstructor=isc.Button;
isc.A.viewButtonDefaults={
        autoParent:"dashboardsToolbar",
        title:"View",
        autoFit:true,
        click:function(){
            this.creator.dashboards.clearCurrentDashboard();
            this.creator.dashboards.viewDashboard();
        }
    };
isc.A.editButtonConstructor=isc.Button;
isc.A.editButtonDefaults={
        autoParent:"dashboardsToolbar",
        title:"Edit",
        autoFit:true,
        click:function(){
            this.creator.dashboards.clearCurrentDashboard();
            this.creator.dashboards.editDashboard();
        }
    };
isc.A.newButtonConstructor=isc.Button;
isc.A.newButtonDefaults={
        autoParent:"dashboardsToolbar",
        title:"New",
        autoFit:true,
        click:function(){
            this.creator.dashboards.newDashboard();
        }
    };
isc.A.cloneButtonConstructor=isc.Button;
isc.A.cloneButtonDefaults={
        autoParent:"dashboardsToolbar",
        title:"Clone",
        autoFit:true,
        click:function(){
            this.creator.dashboards.cloneDashboard();
        }
    };
isc.A.dashboardsToolbarConstructor=isc.HLayout;
isc.A.dashboardsToolbarDefaults={
        autoParent:"dashboardsLayout",
        height:30,
        membersMargin:10,
        defaultLayoutAlign:"center",
        initWidget:function(){
            this.members=[isc.LayoutSpacer.create()];
            this.Super("initWidget",arguments);
        }
    };
isc.A.dashboardsLayoutConstructor=isc.VLayout;
isc.A.dashboardsLayoutDefaults={};
isc.A.paletteConstructor=isc.ListPalette;
isc.A.paletteDefaults={
        paletteNodeDefaults:{
            type:"ListGrid",
            defaults:{
                autoFetchData:true,
                showFilterEditor:true
            }
        },
        fields:[
            {name:"title",title:"Component"}
        ],
        initWidget:function(){
            this.Super("initWidget",arguments);
            this.initCacheData();
        },
        initCacheData:function(){
            if(this.paletteDataSourceList){
                var dataSources=this.paletteDataSourceList;
                if(!isc.isAn.Array(dataSources))dataSources=[dataSources];
                var data=[];
                for(var i=0;i<dataSources.length;i++){
                    var defaults=isc.clone(this.paletteNodeDefaults),
                        dsName=(isc.isAn.Instance(dataSources[i])?dataSources[i].getID():dataSources[i]),
                        record=isc.addProperties({},defaults,this.paletteNodeProperties);
                    ;
                    record.title=dsName;
                    if(!record.defaults)record.defaults={};
                    record.defaults.dataSource=dsName;
                    data.add(record);
                }
                this.setData(data);
            }else if(this.paletteDataSource){
                var _this=this,
                    ds=isc.DS.get(this.paletteDataSource)
                ;
                ds.fetchData(null,function(response){
                    var records=response.data;
                    if(records&&records.length>0){
                        var data=[],
                            dsNameField=_this.paletteDataSourceNameField
                        ;
                        for(var i=0;i<records.length;i++){
                            var defaults=isc.clone(_this.paletteNodeDefaults),
                                dsName=records[i][dsNameField],
                                record=isc.addProperties({},defaults,_this.paletteNodeProperties);
                            ;
                            record.title=dsName;
                            if(!record.defaults)record.defaults={};
                            record.defaults.dataSource=dsName;
                            data.add(record);
                        }
                        _this.setData(data);
                    }else{
                        _this.logWarn("No dataSources found in paletteDataSource "+_this.paletteDataSource);
                    }
                });
            }
        }
    };
isc.A.editPaneConstructor=isc.EditPane;
isc.A.editPaneDefaults={
        autoParent:"editLayout",
        border:"1px solid black",
        visibility:"hidden",
        initWidget:function(){
            this.extraPalettes=isc.HiddenPalette.create({
                data:[
                    {title:"ListGridField",type:"ListGridField"}
                ]
            });
            this.Super("initWidget",arguments);
            this.addFromPaletteNode(this.creator.initialPortalPaletteNode);
        }
    };
isc.A.saveButtonConstructor=isc.Button;
isc.A.saveButtonDefaults={
        autoParent:"editToolbar",
        title:"Save",
        autoFit:true,
        click:function(){
            this.creator.dashboards.saveDashboard();
        }
    };
isc.A.discardButtonConstructor=isc.Button;
isc.A.discardButtonDefaults={
        autoParent:"editToolbar",
        title:"Discard changes",
        autoFit:true,
        click:function(){
            this.creator.dashboards.refreshDashboard();
        }
    };
isc.A.editToolbarConstructor=isc.HLayout;
isc.A.editToolbarDefaults={
        autoParent:"editLayout",
        height:30,
        membersMargin:10,
        defaultLayoutAlign:"center",
        visibility:"hidden",
        initWidget:function(){
            this.members=[isc.LayoutSpacer.create()];
            this.Super("initWidget",arguments);
        }
    };
isc.A.editLayoutConstructor=isc.VLayout;
isc.A.editLayoutDefaults={
        width:"100%",
        height:"100%"
    };
isc.A.selectorConstructor=isc.TabSet;
isc.A.selectorDefaults={
        width:"25%"
    };
isc.B.push(isc.A.initWidget=function isc_DSDashboard_initWidget(){
        this.Super("initWidget",arguments);
        var selectorTabs=[
            {title:this.selectorDashboardsTabTitle,pane:this.addAutoChild("dashboardsLayout")},
            {title:this.selectorPaletteTabTitle,pane:this.addAutoChild("palette",{
                paletteDataSource:this.paletteDataSource,
                paletteDataSourceNameField:this.paletteDataSourceNameField,
                paletteDataSourceList:this.paletteDataSourceList
            })}
        ];
        this.addAutoChild("selector",{tabs:selectorTabs});
        this.addAutoChild("dashboards",{
            initialPortalPaletteNode:this.initialPortalPaletteNode,
            newDashboardDescription:this.newDashboardDescription,
            cloneDashboardDescriptionSuffix:this.cloneDashboardDescriptionSuffix,
            dataSource:this.dataSource,
            dashboardDescriptionField:this.descriptionField,
            dashboardLayoutField:this.layoutField
        });
        this.addAutoChild("dashboardsToolbar");
        this.addAutoChild("viewButton");
        this.addAutoChild("editButton");
        this.addAutoChild("newButton");
        this.addAutoChild("cloneButton");
        this.addAutoChild("editLayout");
        this.addAutoChild("editPane");
        this.addAutoChild("editToolbar");
        this.addAutoChild("saveButton");
        this.addAutoChild("discardButton");
        this.palette.setDefaultEditContext(this.editPane);
        this.editPane.setDefaultPalette(this.palette);
    }
);
isc.B._maxIndex=isc.C+1;

isc.A=isc.Class;
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.B.push(isc.A.getClassIcon=function isc_c_Class_getClassIcon(className,state){
        if(!className)className=this.getClassName();
        if(className){
            if(!isc.isA.String(className)&&className.getClassName){
                className=className.getClassName();
            }
            var iconName=className;
            if(isc.Media&&isc.isA.String(iconName)){
                if(state)iconName+=("_"+state);
                return isc.Media.getStockIcon(iconName);
            }
        }
    }
);
isc.B._maxIndex=isc.C+1;

isc.A=isc.Class.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.B.push(isc.A.getClassIcon=function isc_Class_getClassIcon(state){
        return isc.Class.getClassIcon(this.getClassName(),state);
    }
);
isc.B._maxIndex=isc.C+1;

isc.A=isc.Class;
isc.A.standardClassIcons=[
        {
            "index":10,
            "name":"Class",
            "scImgURL":"classes/Class.png"
        },
        {
            "index":20,
            "name":"AffineTransform",
            "scImgURL":"classes/AffineTransform.png"
        },
        {
            "index":30,
            "name":"List",
            "scImgURL":"classes/List.png"
        },
        {
            "index":40,
            "name":"SGWTFactory",
            "scImgURL":"classes/SGWTFactory.png"
        },
        {
            "index":50,
            "name":"Tree",
            "scImgURL":"classes/Tree.png"
        },
        {
            "index":60,
            "name":"BaseWidget",
            "scImgURL":"classes/BaseWidget.png"
        },
        {
            "index":70,
            "name":"Canvas",
            "scImgURL":"classes/Canvas.png"
        },
        {
            "index":80,
            "name":"MathFunction",
            "scImgURL":"classes/MathFunction.png"
        },
        {
            "index":90,
            "name":"Layout",
            "scImgURL":"classes/Layout.png"
        },
        {
            "index":100,
            "name":"PortalRow",
            "scImgURL":"classes/PortalRow.png"
        },
        {
            "index":110,
            "name":"PortalColumn",
            "scImgURL":"classes/PortalColumn.png"
        },
        {
            "index":120,
            "name":"VLayout",
            "scImgURL":"classes/VLayout.png",
            "states":["drop"]
        },
        {
            "index":130,
            "name":"ListGrid",
            "scImgURL":"classes/ListGrid.png",
            "states":["drop"]
        },
        {
            "index":140,
            "name":"GridRenderer",
            "scImgURL":"classes/GridRenderer.png"
        },
        {
            "index":150,
            "name":"HLayout",
            "scImgURL":"classes/HLayout.png",
            "states":["drop"]
        },
        {
            "index":160,
            "name":"HiliteRule",
            "scImgURL":"classes/HiliteRule.png"
        },
        {
            "index":170,
            "name":"FormItem",
            "scImgURL":"classes/FormItem.png"
        },
        {
            "index":180,
            "name":"TextItem",
            "scImgURL":"classes/TextItem.png"
        },
        {
            "index":190,
            "name":"ComboBoxItem",
            "scImgURL":"classes/ComboBoxItem.png",
            "states":["drop"]
        },
        {
            "index":200,
            "name":"CanvasItem",
            "scImgURL":"classes/CanvasItem.png"
        },
        {
            "index":210,
            "name":"RelationItem",
            "scImgURL":"classes/RelationItem.png"
        },
        {
            "index":220,
            "name":"Action",
            "scImgURL":"classes/Action.png"
        },
        {
            "index":230,
            "name":"DataSource",
            "scImgURL":"classes/DataSource.png"
        },
        {
            "index":240,
            "name":"StringBuffer",
            "scImgURL":"classes/StringBuffer.png"
        },
        {
            "index":250,
            "name":"StatefulCanvas",
            "scImgURL":"classes/StatefulCanvas.png"
        },
        {
            "index":260,
            "name":"Button",
            "scImgURL":"classes/Button.png"
        },
        {
            "index":270,
            "name":"DrawItem",
            "scImgURL":"classes/DrawItem.png"
        },
        {
            "index":280,
            "name":"URIBuilder",
            "scImgURL":"classes/URIBuilder.png"
        },
        {
            "index":290,
            "name":"StackTrace",
            "scImgURL":"classes/StackTrace.png"
        },
        {
            "index":300,
            "name":"ChromeStackTrace",
            "scImgURL":"classes/ChromeStackTrace.png"
        },
        {
            "index":310,
            "name":"StretchImg",
            "scImgURL":"classes/StretchImg.png"
        },
        {
            "index":320,
            "name":"StretchImgButton",
            "scImgURL":"classes/StretchImgButton.png"
        },
        {
            "index":330,
            "name":"ToolStrip",
            "scImgURL":"classes/ToolStrip.png",
            "states":["drop"]
        },
        {
            "index":340,
            "name":"ToolStripButton",
            "scImgURL":"classes/ToolStripButton.png"
        },
        {
            "index":350,
            "name":"MenuButton",
            "scImgURL":"classes/MenuButton.png"
        },
        {
            "index":360,
            "name":"ToolStripMenuButton",
            "scImgURL":"classes/ToolStripMenuButton.png"
        },
        {
            "index":370,
            "name":"SelectItem",
            "scImgURL":"classes/SelectItem.png",
            "states":["drop"]
        },
        {
            "index":380,
            "name":"ContainerItem",
            "scImgURL":"classes/ContainerItem.png"
        },
        {
            "index":390,
            "name":"DateItem",
            "scImgURL":"classes/DateItem.png"
        },
        {
            "index":400,
            "name":"TimeItem",
            "scImgURL":"classes/TimeItem.png"
        },
        {
            "index":410,
            "name":"StaticTextItem",
            "scImgURL":"classes/StaticTextItem.png"
        },
        {
            "index":420,
            "name":"MiniDateRangeItem",
            "scImgURL":"classes/MiniDateRangeItem.png"
        },
        {
            "index":430,
            "name":"SpinnerItem",
            "scImgURL":"classes/SpinnerItem.png"
        },
        {
            "index":440,
            "name":"ButtonItem",
            "scImgURL":"classes/ButtonItem.png"
        },
        {
            "index":450,
            "name":"SectionItem",
            "scImgURL":"classes/SectionItem.png",
            "states":["drop"]
        },
        {
            "index":460,
            "name":"DetailViewer",
            "scImgURL":"classes/DetailViewer.png",
            "states":["drop"]
        },
        {
            "index":470,
            "name":"Menu",
            "scImgURL":"classes/Menu.png",
            "states":["drop"]
        },
        {
            "index":480,
            "name":"ScrollingMenu",
            "scImgURL":"classes/ScrollingMenu.png"
        },
        {
            "index":490,
            "name":"PickListMenu",
            "scImgURL":"classes/PickListMenu.png"
        },
        {
            "index":500,
            "name":"Calendar",
            "scImgURL":"classes/Calendar.png"
        },
        {
            "index":510,
            "name":"CalendarView",
            "scImgURL":"classes/CalendarView.png"
        },
        {
            "index":520,
            "name":"MonthSchedule",
            "scImgURL":"classes/MonthSchedule.png"
        },
        {
            "index":530,
            "name":"DateChooser",
            "scImgURL":"classes/DateChooser.png"
        },
        {
            "index":540,
            "name":"DateGrid",
            "scImgURL":"classes/DateGrid.png"
        },
        {
            "index":550,
            "name":"TabSet",
            "scImgURL":"classes/TabSet.png",
            "states":["drop"]
        },
        {
            "index":560,
            "name":"Toolbar",
            "scImgURL":"classes/Toolbar.png"
        },
        {
            "index":570,
            "name":"TabBar",
            "scImgURL":"classes/TabBar.png"
        },
        {
            "index":580,
            "name":"SectionStack",
            "scImgURL":"classes/SectionStack.png",
            "states":["drop"]
        },
        {
            "index":590,
            "name":"ToolStripGroup",
            "scImgURL":"classes/ToolStripGroup.png"
        },
        {
            "index":600,
            "name":"Window",
            "scImgURL":"classes/Window.png",
            "states":["drop"]
        },
        {
            "index":610,
            "name":"Dialog",
            "scImgURL":"classes/Dialog.png"
        },
        {
            "index":620,
            "name":"PickTreeItem",
            "scImgURL":"classes/PickTreeItem.png"
        },
        {
            "index":630,
            "name":"RelativeDateItem",
            "scImgURL":"classes/RelativeDateItem.png"
        },
        {
            "index":640,
            "name":"ColorItem",
            "scImgURL":"classes/ColorItem.png"
        },
        {
            "index":650,
            "name":"DrawLabel",
            "scImgURL":"classes/DrawLabel.png"
        },
        {
            "index":660,
            "name":"CycleItem",
            "scImgURL":"classes/CycleItem.png"
        },
        {
            "index":670,
            "name":"CheckboxItem",
            "scImgURL":"classes/CheckboxItem.png"
        },
        {
            "index":680,
            "name":"TreeGrid",
            "scImgURL":"classes/TreeGrid.png",
            "states":["drop"]
        },
        {
            "index":690,
            "name":"CubeGrid",
            "scImgURL":"classes/CubeGrid.png"
        },
        {
            "index":700,
            "name":"NavigationBar",
            "scImgURL":"classes/NavigationBar.png"
        },
        {
            "index":710,
            "name":"NavigationButton",
            "scImgURL":"classes/NavigationButton.png"
        },
        {
            "index":720,
            "name":"ColorPicker",
            "scImgURL":"classes/ColorPicker.png"
        },
        {
            "index":730,
            "name":"Hover",
            "scImgURL":"classes/Hover.png"
        },
        {
            "index":740,
            "name":"PropertySheet",
            "scImgURL":"classes/PropertySheet.png"
        },
        {
            "index":750,
            "name":"RibbonBar",
            "scImgURL":"classes/RibbonBar.png"
        },
        {
            "index":760,
            "name":"Notify",
            "scImgURL":"classes/Notify.png"
        },
        {
            "index":770,
            "name":"Slider",
            "scImgURL":"classes/Slider.png"
        },
        {
            "index":780,
            "name":"SectionHeader",
            "scImgURL":"classes/SectionHeader.png"
        },
        {
            "index":790,
            "name":"Process",
            "scImgURL":"classes/Process.png"
        },
        {
            "index":800,
            "name":"Splitbar",
            "scImgURL":"classes/Splitbar.png"
        },
        {
            "index":810,
            "name":"ResizeBar",
            "scImgURL":"classes/ResizeBar.png"
        },
        {
            "index":820,
            "name":"UploadItem",
            "scImgURL":"classes/UploadItem.png"
        },
        {
            "index":830,
            "name":"HeaderItem",
            "scImgURL":"classes/HeaderItem.png"
        },
        {
            "index":840,
            "name":"LinkItem",
            "scImgURL":"classes/LinkItem.png"
        },
        {
            "index":850,
            "name":"RichTextEditor",
            "scImgURL":"classes/RichTextEditor.png"
        },
        {
            "index":860,
            "name":"FacetChart",
            "scImgURL":"classes/FacetChart.png"
        },
        {
            "index":870,
            "name":"PickList",
            "scImgURL":"classes/PickList.png"
        },
        {
            "index":880,
            "name":"Scrollbar",
            "scImgURL":"classes/Scrollbar.png"
        },
        {
            "index":1000,
            "name":"DynamicForm",
            "scImgURL":"classes/DynamicForm.png",
            "states":["drop"]
        },
        {
            "index":1010,
            "name":"DataView",
            "scImgURL":"classes/DataView.png",
            "states":["drop"]
        },
        {
            "index":1020,
            "name":"Deck",
            "scImgURL":"classes/Deck.png",
            "states":["drop"]
        },
        {
            "index":1030,
            "name":"MenuItem",
            "scImgURL":"classes/MenuItem.png",
            "states":["drop"]
        },
        {
            "index":1040,
            "name":"IconButton",
            "scImgURL":"classes/IconButton.png",
            "states":["drop"]
        },
        {
            "index":1050,
            "name":"PortalLayout",
            "scImgURL":"classes/PortalLayout.png",
            "states":["drop"]
        },
        {
            "index":1060,
            "name":"RadioGroupItem",
            "scImgURL":"classes/RadioGroup.png",
            "states":["drop"]
        },
        {
            "index":1070,
            "name":"SearchForm",
            "scImgURL":"classes/SearchForm.png",
            "states":["drop"]
        },
        {
            "index":1080,
            "name":"SectionStackSection",
            "scImgURL":"classes/SectionStackSection.png",
            "states":["drop"]
        },
        {
            "index":1090,
            "name":"SelectOtherItem",
            "scImgURL":"classes/SelectOtherItem.png",
            "states":["drop"]
        },
        {
            "index":1100,
            "name":"SplitPane",
            "scImgURL":"classes/SplitPane.png",
            "states":["drop"]
        },
        {
            "index":1110,
            "name":"TileGrid",
            "scImgURL":"classes/TileGrid.png",
            "states":["drop"]
        },
        {
            "index":1120,
            "name":"TriplePane",
            "scImgURL":"classes/TriplePane.png",
            "states":["drop"]
        },
        {
            "index":1130,
            "name":"AbsoluteForm",
            "scImgURL":"classes/AbsoluteForm.png",
            "states":["drop"]
        },
        {
            "index":1140,
            "name":"LayoutSpacer",
            "scImgURL":"classes/LayoutSpacer.png"
        },
        {
            "index":1150,
            "name":"Label",
            "scImgURL":"classes/Label.png"
        },
        {
            "index":1160,
            "name":"BlurbItem",
            "scImgURL":"classes/BlurbItem.png"
        },
        {
            "index":1170,
            "name":"FileItem",
            "scImgURL":"classes/FileItem.png"
        },
        {
            "index":1180,
            "name":"HiddenItem",
            "scImgURL":"classes/HiddenItem.png"
        },
        {
            "index":1190,
            "name":"PasswordItem",
            "scImgURL":"classes/PasswordItem.png"
        },
        {
            "index":1200,
            "name":"ResetItem",
            "scImgURL":"classes/ResetItem.png"
        },
        {
            "index":1210,
            "name":"SpacerItem",
            "scImgURL":"classes/SpacerItem.png"
        },
        {
            "index":1220,
            "name":"StaticTextItem",
            "scImgURL":"classes/StaticTextItem.png"
        },
        {
            "index":1230,
            "name":"SubmitItem",
            "scImgURL":"classes/SubmitItem.png"
        },
        {
            "index":1240,
            "name":"TextAreaItem",
            "scImgURL":"classes/TextAreaItem.png"
        },
        {
            "index":1250,
            "name":"TextItem",
            "scImgURL":"classes/TextItem.png"
        },
        {
            "index":1260,
            "name":"TimeItem",
            "scImgURL":"classes/TimeItem.png"
        },
        {
            "index":1270,
            "name":"ToolStripSeparator",
            "scImgURL":"classes/ToolStripSeparator.png"
        },
        {
            "index":1280,
            "name":"SpinnerItem",
            "scImgURL":"classes/SpinnerItem.png"
        },
        {
            "index":1290,
            "name":"FontLoader",
            "scImgURL":"classes/FontLoader.png"
        },
        {
            "index":1300,
            "name":"RibbonGroup",
            "scImgURL":"classes/RibbonGroup.png"
        },
        {
            "index":1310,
            "name":"FormulaBuilder",
            "scImgURL":"classes/FormulaBuilder.png"
        },
        {
            "index":1320,
            "name":"FilterBuilder",
            "scImgURL":"classes/FilterBuilder.png"
        },
        {
            "index":1330,
            "name":"ProgressBar",
            "scImgURL":"classes/ProgressBar.png"
        },
        {
            "index":1340,
            "name":"Tour",
            "scImgURL":"classes/Tour.png"
        },
        {
            "index":1350,
            "name":"FloatItem",
            "scImgURL":"classes/FloatItem.png"
        },
        {
            "index":1360,
            "name":"HandPlacedForm",
            "scImgURL":"classes/AbsoluteForm.png",
            "states":["drop"]
        },
        {
            "index":1370,
            "name":"ScreenLoader",
            "scImgURL":"classes/ScreenLoader.png"
        },
        {
            "index":2000,
            "name":"Header",
            "scImgURL":"classes/Header.png"
        },
        {
            "index":2010,
            "name":"Background",
            "scImgURL":"classes/Background.png"
        },
        {
            "index":2020,
            "name":"Text",
            "scImgURL":"classes/Text.png"
        },
        {
            "index":2030,
            "name":"Border",
            "scImgURL":"classes/Border.png"
        },
        {
            "index":2040,
            "name":"GroupLabel",
            "scImgURL":"classes/GroupLabel.png"
        },
        {
            "index":2050,
            "name":"Font",
            "scImgURL":"classes/Font.png"
        },
        {
            "index":2060,
            "name":"ValuesManager",
            "scImgURL":"classes/ValuesManager.png"
        }
    ]
;

isc.Class.standardClassIcons.setProperty("group","classIcons");
isc.defineClass("CSSPreviewCanvas","Canvas");
isc.A=isc.CSSPreviewCanvas.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.width=1;
isc.A.height=1;
isc.A.layoutAlign="center";
isc.A.autoDraw=true;
isc.A.autoSize=true;
isc.A.contents="Preview<nobr>Settings";
isc.A.overflow="visible";
isc.B.push(isc.A.initWidget=function isc_CSSPreviewCanvas_initWidget(){
        this.Super("initWidget",arguments);
    }
,isc.A.getPreviewHandle=function isc_CSSPreviewCanvas_getPreviewHandle(){
        var handle=this.getStyleHandle();
        return handle;
    }
);
isc.B._maxIndex=isc.C+2;

isc.defineClass("BorderEditorItem","CanvasItem");
isc.A=isc.BorderEditorItem.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.shouldSaveValue=true;
isc.A.showItemTitles=true;
isc.A.autoDraw=false;
isc.A.defaultValue="1px none #808080";
isc.A.canvasDefaults={
        _constructor:"DynamicForm",
        titleOrientation:"top",
        overflow:"visible",
        numCols:3,
        colWidths:[85,50,"*"],
        titleWidth:90,
        height:1,
        paddingLeft:7,
        autoDraw:false,
        itemChanged:function(){
            this.creator.fireChanged();
        }
    };
isc.B.push(isc.A.init=function isc_BorderEditorItem_init(){
        this.canvasDefaults.items=[
            {name:"border-style",type:"string",title:"Style",width:"*",
                valueMap:isc.CSSEditor.getCssValueMap("border-style"),
                defaultValue:"none",showTitle:this.showItemTitles,
                changed:function(form,item,value){
                    var disable=(value=="none");
                    form.getItem("border-width").setDisabled(disable);
                    form.getItem("border-color").setDisabled(disable);
                }
            },
            {name:"border-width",title:"Width",editorType:"SpinnerItem",width:"*",
                defaultValue:1,showTitle:this.showItemTitles
            },
            {name:"border-color",title:"Color",editorType:"ColorItem",colSpan:"*",
                width:"*",defaultValue:"#000000",showTitle:this.showItemTitles
            }
        ];
        this.Super("init",arguments);
        this.form=this.canvas;
    }
,isc.A.drawn=function isc_BorderEditorItem_drawn(){
        this.Super("drawn",arguments);
        this.storeValue(this.getValue());
    }
,isc.A.setValue=function isc_BorderEditorItem_setValue(value){
        if(isc.isA.String(value)){
            var border=isc.CSSEditor.parseCSSSetting("border",value);
            var css=border["border-width"]+" "+border["border-style"]+" "+border["border-color"];
            this._initialValue={css:css,obj:border};
        }else{
            this._initialValue=value;
        }
        this.Super("setValue",value);
        this.canvas.setValues(border);
        if(border){
            this.canvas.getField("border-width").setDisabled(border["border-style"]=="none");
            this.canvas.getField("border-color").setDisabled(border["border-style"]=="none");
        }
    }
,isc.A.getValue=function isc_BorderEditorItem_getValue(){
        var values=this.getValues();
        var result;
        if(values["border-style"]=="none"){
            return"none";
        }else if(this.returnSingleValue!=false){
            return this.getSingleValue();
        }else{
            return values;
        }
    }
,isc.A.getSingleValue=function isc_BorderEditorItem_getSingleValue(){
        var values=this.canvas.getValues();
        if(values.style=="none")return values.style;
        return values["border-width"]+"px "+values["border-style"]+" "+values["border-color"];
    }
,isc.A.getValues=function isc_BorderEditorItem_getValues(changedOnly){
        if(changedOnly){
        }
        return this.canvas.getValues();
    }
,isc.A.fireChanged=function isc_BorderEditorItem_fireChanged(){
        if(this._inFireChanged)return;
        this._inFireChanged=true;
        this.storeValue(this.getValue());
        this.form.itemChanged(this,this.getValue());
        delete this._inFireChanged;
    }
);
isc.B._maxIndex=isc.C+7;

isc.defineClass("FontEditorItem","CanvasItem");
isc.A=isc.FontEditorItem;
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.B.push(isc.A.getStyledFontName=function isc_c_FontEditorItem_getStyledFontName(name,title){
        return"<span style='font-family: "+name+";'>"+title+"</span>";
    }
,isc.A.getAvailableFonts=function isc_c_FontEditorItem_getAvailableFonts(){
        var result={};
        for(var i=0;i<isc.FontLoader.customFonts.length;i++){
            var fontName=isc.FontLoader.customFonts[i];
            result[fontName]=isc.FontEditorItem.getStyledFontName(fontName,
                fontName.charAt(0).toUpperCase()+fontName.slice(1));
        };
        return result;
    }
);
isc.B._maxIndex=isc.C+2;

isc.A=isc.FontEditorItem.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.shouldSaveValue=true;
isc.A.showItemTitles=true;
isc.A.autoDraw=false;
isc.A.canvasDefaults={
        _constructor:"DynamicForm",
        titleOrientation:"top",
        titleAlign:"center",
        overflow:"visible",
        numCols:4,
        colWidths:["*",60,60,80],
        height:1,
        padding:0,
        showItemTitles:true,
        autoDraw:false,
        itemChanged:function(){
            this.creator.fireChanged();
        }
    };
isc.B.push(isc.A.init=function isc_FontEditorItem_init(){
        this.canvasDefaults.items=[
            {name:"font-family",title:"Family",editorType:"SelectItem",width:"*",
                defaultValue:"RobotoLight",showTitle:true,
                getValueMap:function(){
                    return isc.FontEditorItem.getAvailableFonts();
                }
            },
            {name:"font-size",title:"Size",editorType:"SpinnerItem",width:"*",
                defaultValue:14,showTitle:true
            },
            {name:"line-height",title:"Line H",editorType:"SpinnerItem",width:"*",
                defaultValue:14,showTitle:true
            },
            {name:"font-weight",title:"Weight",editorType:"SelectItem",width:"*",
                defaultValue:"400",showTitle:true,
                getValueMap:function(){
                    return isc.CSSEditor.getCssValueMap("font-weight");
                }
            },
            {name:"font-variant",title:"Variant",editorType:"SelectItem",width:"*",
                defaultValue:"normal",showTitle:true,
                showIf:"return false;",
                valueMap:[{"normal":"Normal","small-caps":"SmallCaps"}]
            }
        ];
        this.Super("init",arguments);
    }
,isc.A.drawn=function isc_FontEditorItem_drawn(){
        this.Super("drawn",arguments);
        this.storeValue(this.getValue());
    }
,isc.A.setValue=function isc_FontEditorItem_setValue(value){
        if(value!=null){
            var bits=value.split(" ");
            var font={};
            font["font-family"]=bits[bits.length-1];
            bits.removeAt(bits.length-1);
            var sizeBits=bits[bits.length-1].split("/");
            font["font-size"]=parseInt(sizeBits[0]);
            if(sizeBits.length==2)font["line-height"]=parseInt(sizeBits[1]);
            this._initialValue={css:value,obj:font};
        }else{
            this._initialValue=value;
        }
        this.canvas.setValues(font);
    }
,isc.A.getValue=function isc_FontEditorItem_getValue(){
        return this.getSingleValue();
    }
,isc.A.getSingleValue=function isc_FontEditorItem_getSingleValue(){
        var values=this.getValues();
        var result=values["font-family"];
        if(values["font-size"]!=null){
            var sizeCSS=values["font-size"]+"px";
            if(values["line-height"]!=null)sizeCSS+="/"+values["line-height"]+"px";
            result=sizeCSS+" "+result;
        }
        if(values["font-weight"]!=null){
            result=values["font-weight"]+" "+result;
        }
        if(values["font-variant"]!=null){
            result=values["font-variant"]+" "+result;
        }
        return result;
    }
,isc.A.getValues=function isc_FontEditorItem_getValues(changedOnly){
        if(changedOnly){
        }
        return this.canvas.getValues();
    }
,isc.A.fireChanged=function isc_FontEditorItem_fireChanged(){
        if(this._inFireChanged)return;
        this._inFireChanged=true;
        this.storeValue(this.getValue());
        this.form.itemChanged(this,this.getValue());
        delete this._inFireChanged;
    }
);
isc.B._maxIndex=isc.C+7;

isc.defineClass("CSSEditor","VLayout");
isc.A=isc.CSSEditor;
isc.A.cssValueMaps={
        "border-style":["none","solid","dotted","dashed","double","groove","ridge","inset",
            "outset","hidden"
        ],
        "font-weight":{
            "100":"100","200":"200","300":"300","400":"Normal","500":"500",
            "600":"600","700":"Bold","800":"800","900":"900"
        },
        "vertical-align":["baseline","sub","super","top","text-top","middle","bottom",
            "text-bottom"
        ],
        "text-align":["left","right","center","justify"],
        "text-overflow":["clip","ellipsis"]
    }
;

isc.A=isc.CSSEditor;
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.B.push(isc.A.getStyledFontWeight=function isc_c_CSSEditor_getStyledFontWeight(weight,title){
        return"<span style='font-weight: "+weight+";'>"+title+"</span>";
    }
,isc.A.getStyledFontWeights=function isc_c_CSSEditor_getStyledFontWeights(){
        var result={};
        var obj=isc.CSSEditor.cssValueMaps["font-weight"];
        for(var weight in obj){
            result[weight]=isc.CSSEditor.getStyledFontWeight(weight,obj[weight]);
        };
        return result;
    }
,isc.A.getStyledFontName=function isc_c_CSSEditor_getStyledFontName(name,title){
        return"<span style='font-family: "+name+";'>"+title+"</span>";
    }
,isc.A.getAvailableFonts=function isc_c_CSSEditor_getAvailableFonts(){
        var result={};
        for(var i=0;i<isc.FontLoader.customFonts.length;i++){
            var fontName=isc.FontLoader.customFonts[i];
            result[fontName]=isc.CSSEditor.getStyledFontName(fontName,
                fontName.charAt(0).toUpperCase()+fontName.slice(1));
        };
        return result;
    }
,isc.A.getCssValueMap=function isc_c_CSSEditor_getCssValueMap(cssAttr){
        if(cssAttr=="font-weight"){
            return isc.CSSEditor.getStyledFontWeights();
        }else if(cssAttr=="font-family"){
            return isc.CSSEditor.getAvailableFonts();
        }else{
            var result=isc.shallowClone(isc.CSSEditor.cssValueMaps[cssAttr]);
            return result;
        }
        return;
    }
,isc.A.htmlAttrToCss=function isc_c_CSSEditor_htmlAttrToCss(html){
        return html.replace(/([A-Z])/g,'-$1').trim().toLowerCase();
    }
);
isc.B._maxIndex=isc.C+6;

isc.A=isc.CSSEditor;
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.styleGroups=[
        {name:"border",title:"Borders",allowAsymmetry:true,
            settings:["border","border-radius"]
        },
        {name:"padding",title:"Padding",allowAsymmetry:true,
            settings:["padding"]
        },
        {name:"font",title:"Font",
            settings:["font","color"]
        },
        {name:"content",title:"Content Settings",
            settings:["color","font","font-variant","text-shadow"
            ]
        },
        {name:"box",title:"Box Settings",allowAsymmetry:true,
            settings:["border","border-radius","padding","margin","box-shadow"]
        },
        {name:"background",title:"Background Settings",
            settings:[
                "background-color","background-image","background-gradient"
            ]
        },
        {name:"other",title:"Other Settings",allowAsymmetry:true,allowAddSettings:true,
            settings:[]
        },
        {name:"_default",title:"Settings",expanded:true,canCollapse:false,
            allowAsymmetry:false,allowAddSettings:false,customGroup:true,
            settings:[]
        }
    ];
isc.A.styleSettings=[
        {name:"border",editorType:"CSSBorderItem",
            group:"box",
            title:"Border",allowAsymmetry:true,
            itemProperties:{colSpan:"*"},
            titles:["Border Top","Right","Bottom","Left"],
            asymmetricSettings:["border-top","border-right","border-bottom","border-left"]
        },
        {name:"border-style",editorType:"CSSEditItem",group:"box",title:"Style",
            allowAsymmetry:true,
            defaultEditorType:"SelectItem",
            asymmetricSettings:["border-top-style","border-right-style","border-bottom-style","border-left-style"]
        },
        {name:"border-width",editorType:"CSSSizeItem",group:"box",title:"Width",
            allowAsymmetry:true,
            asymmetricSettings:["border-top-width","border-right-width","border-bottom-width","border-left-width"]
        },
        {name:"border-color",editorType:"CSSEditItem",group:"box",title:"Color",
            allowAsymmetry:true,
            defaultEditorType:"ColorItem",
            asymmetricSettings:["border-top-color","border-right-color","border-bottom-color","border-left-color"]
        },
        {name:"border-top",editorType:"CSSBorderItem",group:"box",title:"Top"},
        {name:"border-right",editorType:"CSSBorderItem",group:"box",title:"Right"},
        {name:"border-bottom",editorType:"CSSBorderItem",group:"box",title:"Bottom"},
        {name:"border-left",editorType:"CSSBorderItem",group:"box",title:"Left"},
        {name:"border-radius",editorType:"CSSSizeItem",group:"box",
            title:"Radius",allowAsymmetry:true,titles:["TL","TR","BR","BL"],
            defaultValue:0,returnSingleValue:true,
            asymmetricSettings:["border-top-left-radius","border-top-right-radius",
                "border-bottom-right-radius","border-bottom-left-radius"]
        },
        {name:"border-top-left-radius",editorType:"CSSSizeItem",
            group:"box",title:"TL"},
        {name:"border-top-right-radius",editorType:"CSSSizeItem",
            group:"box",title:"TR"},
        {name:"border-bottom-right-radius",editorType:"CSSSizeItem",
            group:"box",title:"BR"},
        {name:"border-bottom-left-radius",editorType:"CSSSizeItem",
            group:"box",title:"BL"},
        {name:"outline",editorType:"CSSBorderItem",group:"box",title:"Outline",
            allowAsymmetry:false,basic:false
        },
        {name:"padding",editorType:"CSSSizeItem",group:"box",
            title:"Padding",allowAsymmetry:true,returnSingleValue:true,
            asymmetricSettings:["padding-top","padding-right","padding-bottom","padding-left"]
        },
        {name:"padding-top",editorType:"CSSSizeItem",group:"box",title:"T"},
        {name:"padding-right",editorType:"CSSSizeItem",group:"box",title:"R"},
        {name:"padding-bottom",editorType:"CSSSizeItem",group:"box",title:"B"},
        {name:"padding-left",editorType:"CSSSizeItem",group:"box",title:"L"},
        {name:"margin",editorType:"CSSSizeItem",group:"box",
            title:"Margin",allowAsymmetry:true,returnSingleValue:true,
            asymmetricSettings:["margin-top","margin-right","margin-bottom","margin-left"]
        },
        {name:"margin-top",editorType:"CSSSizeItem",group:"box",title:"T"},
        {name:"margin-right",editorType:"CSSSizeItem",group:"box",title:"R"},
        {name:"margin-bottom",editorType:"CSSSizeItem",group:"box",title:"B"},
        {name:"margin-left",editorType:"CSSSizeItem",group:"box",title:"L"},
        {name:"box-shadow",editorType:"CSSEditItem",
            group:"box",title:"Shadow"},
        {name:"color",editorType:"CSSEditItem",defaultEditorType:"ColorItem",
            group:"content",title:"Color",
            editorProperties:{colSpan:2,endRow:true}},
        {name:"font",editorType:"CSSEditItem",group:"content",title:"Font",
            defaultEditorType:"FontEditorItem"
        },
        {name:"font-family",editorType:"CSSEditItem",
            defaultEditorType:"SelectItem",group:"content",title:"Family",
            editorProperties:{
                getValueMap:function(){
                    return isc.CSSEditor.getCssValueMap("font-family");
                }
            }
        },
        {name:"font-size",editorType:"CSSSizeItem",group:"content",title:"Size"},
        {name:"font-weight",editorType:"CSSEditItem",
            group:"content",title:"Weight",
            defaultValue:"400",defaultEditorType:"SelectItem",
            editorProperties:{
                getValueMap:function(){
                    return isc.CSSEditor.getCssValueMap("font-weight");
                }
            }
        },
        {name:"line-height",editorType:"CSSSizeItem",group:"content",title:"Line-height",basic:false},
        {name:"font-variant",editorType:"CSSEditItem",group:"content",title:"Variant",basic:false},
        {name:"text-shadow",editorType:"CSSShadowItem",group:"content",title:"Shadow",basic:false},
        {name:"text-decoration",editorType:"CSSEditItem",group:"content",title:"Decoration",basic:false},
        {name:"vertical-align",editorType:"CSSEditItem",
            defaultEditorType:"SelectItem",group:"content",title:"V-Align",
            editorProperties:{
                getValueMap:function(){
                    return isc.CSSEditor.getCssValueMap("vertical-align");
                }
            }
        },
        {name:"text-align",editorType:"CSSEditItem",
            defaultEditorType:"SelectItem",group:"content",title:"Text Align",
            basic:false,
            editorProperties:{
                getValueMap:function(){
                    return isc.CSSEditor.getCssValueMap("text-align");
                }
            }
        },
        {name:"text-overflow",editorType:"CSSEditItem",
            defaultEditorType:"SelectItem",group:"content",title:"Text Overflow",
            basic:false,
            editorProperties:{
                getValueMap:function(){
                    return isc.CSSEditor.getCssValueMap("text-overflow");
                }
            }
        },
        {name:"transition",editorType:"CSSEditItem",group:"content",title:"Transition",
            basic:false
        },
        {name:"background",editorType:"CSSEditItem",group:"background",
            title:"Background"},
        {name:"background-color",editorType:"ColorItem",group:"background",
            title:"Color"},
        {name:"opacity",editorType:"CSSSizeItem",group:"background",title:"Opacity",
            valueSuffix:"",
            defaultValue:100,
            editorProperties:{
                type:"integer",defaultValue:100,min:0,max:100,valueSuffix:"",step:1
            }
        },
        {name:"background-image",editorType:"ImagePickerItem",group:"background",title:"Image"},
        {name:"background-gradient",editorType:"CSSGradientItem",group:"background",
            settingName:"background-image",
            title:"Gradient"}
    ];
isc.A.showAllSettings=false;
isc.A.skinStyleGroups=[
        {name:"content",title:"Content Settings",expanded:true,
            settings:[
                "color",
                "font-family",
                "font-size",
                "font-weight"
                ,"vertical-align",
                "text-align","text-overflow",
                "text-decoration",
                "transition"
            ]
        },
        {name:"box",title:"Box Settings",allowAsymmetry:true,expanded:true,
            settings:["border"
            ,"border-radius","padding",
            "margin","outline"
            ,
            "box-shadow"
            ]
        },
        {name:"background",title:"Background Settings",expanded:true,
            settings:[
                "background-color","opacity"
            ]
        }
    ];
isc.B.push(isc.A.parseCSSSetting=function isc_c_CSSEditor_parseCSSSetting(setting,value){
        var result={};
        var name=isc.isAn.Object(setting)?setting.name:setting;
        switch(name){
            case"border":
                var str=value;
                if(str=="none"){
                    str="1px none #000000";
                }else{
                    var colorFuncs=str.match(/((rgb|rgba|hsl|hsv)\(.*?\))/g);
                    if(colorFuncs){
                        for(var i=0;i<colorFuncs.length;i++){
                            str=str.replace(colorFuncs[i],new isc.tinycolor(colorFuncs[i]).toHexString());
                        }
                    }
                    colorFuncs=null;
                }
                var bits=str.split(" ");
                var styles=isc.CSSEditor.getCssValueMap("border-style");
                for(var i=0;i<bits.length;i++){
                    if(styles.contains(bits[i])){
                        result["border-style"]=bits[i];
                    }else if(parseInt(bits[i])){
                        result["border-width"]=parseInt(bits[i]);
                    }else{
                        result["border-color"]=bits[i];
                    }
                }
                break;
            case"padding":
                var bits=value.split(" ");
                var rBits=[];
                if(bits.length==1){
                    rBits.add(bits[0]);
                }else{
                    rBits.addList(bits);
                    if(rBits.length==2)rBits.add(rBits[0]);
                    if(rBits.length==3)rBits.add(rBits[1]);
                }
                result[name]=rBits.join("px ").trim();
                break;
            default:
                result[name]=value;
        }
        return result;
    }
,isc.A.getStyleSetting=function isc_c_CSSEditor_getStyleSetting(name){
        var obj=isc.isAn.Object(name)?name:{"name":name};
        var result=isc.addProperties({},isc.CSSEditor.styleSettings.find("name",obj.name),obj);
        return result;
    }
,isc.A.getStyleGroup=function isc_c_CSSEditor_getStyleGroup(name){
        var obj=isc.isAn.Object(name)?name:{"name":name};
        var group=isc.CSSEditor.styleGroups.find("name",obj.name);
        if(!group){
            group=isc.CSSEditor.styleGroups.find("name","_default");
        }
        var result=isc.addProperties({},group,obj);
        return result;
    }
,isc.A.getSkinStyleGroups=function isc_c_CSSEditor_getSkinStyleGroups(){
        return isc.clone(isc.CSSEditor.skinStyleGroups);
    }
,isc.A.getEditObjectForStyle=function isc_c_CSSEditor_getEditObjectForStyle(styleNameOrObject,config){
        var style=styleNameOrObject;
        if(isc.isA.String(style)){
            isc.allowDuplicateStyles=true;
            style=isc.Element.getStyleDeclaration(style,true);
            isc.allowDuplicateStyles=false;
        }else if(styleNameOrObject.style)style=styleNameOrObject.style
        return isc.CSSEditor.normalizeStyle(style);
    }
,isc.A.normalizeStyle=function isc_c_CSSEditor_normalizeStyle(style){
        var result={};
        var groupings=["border","padding","margin","outline","transition","font",
              "box-shadow","text-decoration"];
        var settings={invalid:{},empty:{},other:{}};
        var skipThese=["width","height","zindex","length","cssText"];
        if(!isc.isAn.Array(style))style=[style];
        for(var i=style.length-1;i>=0;i--){
            var obj=style[i];
            for(var key in obj){
                if(key.startsWith("webkit")||skipThese.contains(key))continue;
                if(parseInt(key)==key){
                }else if(obj[key]=="initial"||obj[key]=="inherit"){
                    settings.invalid[key]=obj[key];
                }else if(obj[key]==""){
                    settings.empty[key]=true;
                }else{
                    var cssKey=isc.CSSEditor.htmlAttrToCss(key);
                    result[cssKey]=obj[key];
                    var found=false;
                    for(var j=0;j<groupings.length;j++){
                        if(cssKey.contains(groupings[j])){
                            if(!settings[groupings[j]])settings[groupings[j]]={};
                            settings[groupings[j]][cssKey]=obj[key];
                            found=true;
                            break;
                        }
                    }
                    if(!found&&!isc.isA.Function(obj[key])&&!isc.isA.Object(obj[key])){
                        settings.other[cssKey]=obj[key];
                    }
                }
            }
        }
        var output={};
        for(var key in settings){
            if(key=="invalid"||key=="empty")continue;
            var grouping=settings[key];
            if(key=="other"){
                var keys=isc.getKeys(grouping);
                for(var i=0;i<keys.length;i++){
                    if(isc.isA.Function(grouping[keys[i]])||isc.isA.Object(grouping[keys[i]]))
                        continue;
                    output[keys[i]]=grouping[keys[i]];
                }
                continue;
            }
            var groupKeys=isc.getKeys(grouping);
            if(groupKeys.length==1){
                output[this.htmlAttrToCss(groupKeys[0])]=grouping[groupKeys[0]];
                continue;
            }
            if(key=="border"){
                var valid=false;
                var border=grouping[key],
                    widths=[grouping[key+"-top-width"],grouping[key+"-right-width"],
                        grouping[key+"-bottom-width"],grouping[key+"-left-width"]],
                    styles=[grouping[key+"-top-style"],grouping[key+"-right-style"],
                        grouping[key+"-bottom-style"],grouping[key+"-left-style"]],
                    colors=[grouping[key+"-top-color"],grouping[key+"-right-color"],
                        grouping[key+"-bottom-color"],grouping[key+"-left-color"]],
                    t=!widths[0]?"none":widths[0]+" "+styles[0]+" "+colors[0],
                    r=!widths[1]?"none":widths[1]+" "+styles[1]+" "+colors[1],
                    b=!widths[2]?"none":widths[2]+" "+styles[2]+" "+colors[2],
                    l=!widths[3]?"none":widths[3]+" "+styles[3]+" "+colors[3]
                ;
                if(t==border&&l==border&&b==border&&r==border){
                    output[key]=grouping[key];
                }else{
                    output.border={};
                    output.border[key+"-top"]=t;
                    output.border[key+"-left"]=l;
                    output.border[key+"-bottom"]=b;
                    output.border[key+"-right"]=r;
                    output[key+"-top"]=t;
                    output[key+"-left"]=l;
                    output[key+"-bottom"]=b;
                    output[key+"-right"]=r;
                }
            }else if(key=="outline"){
                var valid=false;
                var outline=grouping[key],
                    width=grouping[key+"-width"],
                    style=grouping[key+"-style"],
                    color=grouping[key+"-color"]
                ;
                if(width=="0px")outline="0px";
                else if(style=="none")outline="none";
                else outline=width+" "+style+" "+color;
                output[key]=outline;
            }else if(key=="padding"||key=="margin"){
                var padding=grouping[key],
                    t=grouping[key+"-top"],
                    l=grouping[key+"-left"],
                    b=grouping[key+"-bottom"],
                    r=grouping[key+"-right"],
                    str=t+" "+r+" "+b+" "+l
                ;
                if(padding.contains(" ")){
                    grouping[key]=padding=t+" "+r+" "+b+" "+l;
                }
                if(str==padding){
                    output[key]=grouping[key];
                }else{
                    output[key+"-top"]=t;
                    output[key+"-left"]=l;
                    output[key+"-bottom"]=b;
                    output[key+"-right"]=r;
                }
            }else if(key=="box-shadow"){
                var keys=isc.getKeys(grouping);
                isc.logWarn(isc.echoFull(this.parseShadowString(grouping.shadow)));
            }else if(key=="font"){
                var keys=isc.getKeys(grouping);
                for(var i=0;i<keys.length;i++){
                    if(isc.isA.Function(grouping[keys[i]])||isc.isA.Object(grouping[keys[i]]))
                        continue;
                    output[keys[i]]=grouping[keys[i]];
                }
                output[key]=grouping[key];
            }else if(key=="transition"){
                var t={
                    "delay":grouping["transition-delay"].replaceAll(" ","").split(","),
                    "duration":grouping["transition-duration"].replaceAll(" ","").split(","),
                    "property":grouping["transition-property"].replaceAll(" ","").split(","),
                    "timing-function":grouping["transition-timing-function"].replaceAll(" ","").split(",")
                };
                var resArr=[];
                var resStr="";
                for(var i=0;i<t.delay.length;i++){
                    resArr.add(t.property[i]+" "+t.duration[i]+" "+
                        t["timing-function"][i]+" "+t.delay[i]);
                }
                output["transition"]=resArr.join(", ");
            }else if(key=="text-decoration"){
                var str=grouping["text-decoration-line"]+" "+
                        grouping["text-decoration-color"]+" "+
                        grouping["text-decoration-style"]
                ;
                output["text-decoration"]=str;
            }
        }
        for(var key in output){
            if(key.contains("color")){
                var color=isc.tinycolor(output[key]);
                if(color.isValid())output[key]=color.toRgbString();
            }else{
                var obj=isc.CSSEditor.styleSettings[key];
                if(obj&&obj.editorType=="CSSSizeItem"){
                    var def=key=="opacity"?1:0;
                    output[key]=parseFloat(output[key])||def;
                }
            }
        }
        if(!output.opacity)output.opacity=1;
        isc.logWarn("Normalized: "+isc.echoFull(output));
        return output;
    }
,isc.A.editProperties=function isc_c_CSSEditor_editProperties(properties,callback,config){
        if(!isc.isAn.Array(properties))properties=[properties];
        config=config||{};
        if(config.left==null)config.left=0;
        if(config.top==null)config.top=0;
        isc.CSSEditor.editPropertyGroup({name:"settings",settings:properties},null,callback,config);
    }
,isc.A.editPropertyGroup=function isc_c_CSSEditor_editPropertyGroup(group,settings,callback,config){
        config=config||{autoDraw:true};
        var groups=[];
        if(group!=null){
            if(isc.isAn.Array(group))groups.addList(group);
            else groups.add(group);
            if(settings){
                groups.map(function(item){item.settings=settings});
            }
            config.groups=groups;
        }
        if(callback)config.editComplete=callback;
        if(config.left==null)config.left=isc.EH.getX();
        if(config.top==null)config.top=isc.EH.getY();
        if(config.width==null)config.width=380;
        if(config.height==null)config.height=1;
        var ed=isc.CSSEditor.create(config);
        if(!ed.isDrawn())ed.draw();
        else ed.redraw();
        ed.show();
        return ed;
    }
,isc.A.showInWindow=function isc_c_CSSEditor_showInWindow(config,callback){
        config=config||{title:"Border / Padding Editor"};
        var editor=isc.CSSEditor.create(config);
        var win=isc.Window.create({
            title:config.title,
            overflow:"visible",
            autoSize:true,
            editComplete:callback,
            editor:editor,
            items:[
                editor
            ],
            hide:function(){
                if(this.editComplete){
                    this.editComplete(this.editor.getCSSProperties(),this.editor.record,this.editor.oldValues);
                }
                this.Super("hide",arguments);
            }
        });
        win.centerInPage();
        win.show();
    }
);
isc.B._maxIndex=isc.C+9;

isc.A=isc.CSSEditor.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.defaultWidth=360;
isc.A.backgroundColor="white";
isc.A.initialGroups=["border","font"];
isc.A.stackDefaults={
        _constructor:"SectionStack",
        width:"100%",height:1,
        headerHeight:30,
        visibilityMode:"multiple",
        animateSections:false,
        overflow:"visible",
        sectionHeaderProperties:{extraSpace:5}
    };
isc.A.sectionHeaderFormDefaults={
        _constructor:"DynamicForm",
        width:1,
        items:[
            {name:"asymmetry",editorType:"CheckboxItem",prompt:"Asymmetric",
                title:"Asymmetric",showTitle:true,width:30,textAlign:"left",
                showIf:"return form.styleGroup.allowAsymmetry;",
                changed:function(form,item,value){
                    var sectionHeader=form.parentElement.parentElement;
                    sectionHeader.items[0].setShowAsymmetry(value);
                }
            },
            {
                name:"addSettings",editorType:"StaticTextItem",showTitle:false,
                icons:[
                    {
                        alwaysEnable:true,
                        src:"[SKINIMG]actions/edit.png",prompt:"Add Settings",
                        click:function(){
                            var section=this.form.parentElement.parentElement.parentElement;
                            section.showAddSettingsDialog();
                        }
                    }
                ],
                showIf:"return form.styleGroup.allowAddSettings;"
            }
        ]
    };
isc.A.sectionFormDefaults={
        _constructor:"CSSEditForm",
        height:1
    };
isc.A.showPreviewControls=true;
isc.A.okButtonDefaults={
        _constructor:"Img",
        width:18,height:18,
        src:"[SKINIMG]actions/accept.png",
        prompt:"Accept changes",
        click:function(){
            this.creator.acceptChanges();
        }
    };
isc.A.cancelButtonDefaults={
        _constructor:"Img",
        width:18,height:18,
        src:"[SKINIMG]actions/cancel.png",
        prompt:"Discard changes",
        click:function(){
            this.creator.discardChanges();
        }
    };
isc.A.previewCanvasDefaults={
        _constructor:"CSSPreviewCanvas"
    };
isc.B.push(isc.A.editStyle=function isc_CSSEditor_editStyle(style,callback,config){
        var editObject=isc.CSSEditor.getEditObjectForStyle(style,config);
        var settingsMap=isc.CSSEditor.styleSettings.makeIndex("name");
        var settings=[];
        for(var key in editObject){
            if(!settingsMap[key]){
                isc.logWarn("Ignoring css attribute '"+key+"' - no default editor...");
            }else{
                settings.add(key);
            }
        }
        this.setValues(editObject);
    }
,isc.A.setValues=function isc_CSSEditor_setValues(values){
        this._settingValues=true;
        this.values=values;
        this.oldValues=isc.addProperties({},this.values);
        for(var i=0;i<this.visibleGroups.length;i++){
            this.visibleGroups[i].form.setData(this.values);
        }
        delete this._settingValues;
        this._valuesChanged();
    }
,isc.A.getChangedValues=function isc_CSSEditor_getChangedValues(){
        var result={};
        var keys=isc.getKeys(this.values);
        for(var i=0;i<keys.length;i++){
            if(this.values[keys[i]]!=this.oldValues[keys[i]])
                result[keys[i]]=this.values[keys[i]];
        }
        return result;
    }
,isc.A.initWidget=function isc_CSSEditor_initWidget(){
        this.visibleGroups=[];
        this.Super("initWidget",arguments);
        this.addAutoChild("stack");
        this.addMember(this.stack);
        this.setGroups();
    }
,isc.A.acceptChanges=function isc_CSSEditor_acceptChanges(){
        if(this.editComplete){
            this.editComplete(this.getCSSProperties(),this.record,this.oldValues);
        }
    }
,isc.A.discardChanges=function isc_CSSEditor_discardChanges(){
        this.setValues(this.values);
        if(this.editCancelled)this.editCancelled();
    }
,isc.A.setGroups=function isc_CSSEditor_setGroups(groups){
        this._settingGroups=true;
        this.clearGroups();
        groups=groups||this.groups;
        if(groups){
            this.addGroups(groups);
        }
        if(this.showPreview!=false){
            this.previewLayout=isc.VLayout.create({
                width:"100%",
                height:70,
                overflow:"auto",
                align:"center",
                defaultLayoutAlign:"center"
            });
            if(!this.previewCanvas){
                this.previewCanvas=this.createAutoChild("previewCanvas",{ID:this.getID()+"_previewCanvas"});
            }
            this.previewLayout.addMembers(this.previewCanvas);
            var controls=null;
            if(this.showPreviewControls){
                this.okButton=this.createAutoChild("okButton");
                this.cancelButton=this.createAutoChild("cancelButton");
                controls=[this.cancelButton,this.okButton]
            }
            this.stack.addSection({name:"preview",title:"Preview",
                height:30,
                destroyOnRemove:true,
                expanded:true,canCollapse:false,
                controls:controls,
                overflow:"auto",
                items:[this.previewLayout]
            });
        }
        delete this._settingGroups;
        this.updatePreview();
    }
,isc.A.addGroups=function isc_CSSEditor_addGroups(groups,suppressUpdatePreview){
        if(!groups)return;
        if(!isc.isAn.Array(groups))groups=[groups];
        for(var i=0;i<groups.length;i++){
            var group=this.getStyleGroup(groups[i]);
            var s=this.getSection(group);
            group.section=s;
            group.form=s.items[0];
            this.visibleGroups.add(group);
            if(this.previewLayout)this.stack.addSection(s,this.stack.sections.length-2);
            else this.stack.addSection(s);
        }
        if(!suppressUpdatePreview)this.updatePreview();
    }
,isc.A.clearGroups=function isc_CSSEditor_clearGroups(){
        this.visibleForms&&this.visibleForms.removeAll();
        this.visibleGroups&&this.visibleGroups.removeAll();
        this.previewCanvas=null;
        this.previewLayout=null;
        this.stack.removeSection(this.stack.getSectionNames());
    }
,isc.A.getGroup=function isc_CSSEditor_getGroup(name){
        return this.visibleGroups.find("name",name);
    }
,isc.A.getStyleGroup=function isc_CSSEditor_getStyleGroup(name){
        return isc.CSSEditor.getStyleGroup(name);
    }
,isc.A.getSection=function isc_CSSEditor_getSection(name,settings){
        var group=isc.isAn.Object(name)?name:this.getStyleGroup(name);
        if(!group)return;
        if(settings)group.settings=settings;
        var form=this.createGroupForm(group);
        if(!this.visibleForms)this.visibleForms=[];
        this.visibleForms.add(form);
        var shouldExpand=group.expanded!=null?group.expanded:
                !this.stack.sections||this.stack.sections.length==0;
        var section={
            name:group.name,
            title:group.title,
            expanded:shouldExpand,
            allowAsymmetry:group.allowAsymmetry,
            allowAddSettings:group.allowAddSettings,
            styleGroup:group,
            showHeader:group.showSectionHeader==null?true:group.showSectionHeader,
            controls:[this.createAutoChild("sectionHeaderForm",{styleGroup:group})],
            items:[form]
        };
        if(group.canCollapse!=null)section.canCollapse=group.canCollapse;
        if(group.headerHeight!=null)section.headerHeight=group.headerHeight;
        if(group.showAsymmetry!=null)section.controls[0].setValues({"asymmetry":group.showAsymmetry});
        section.destroyOnRemove=true;
        group.form=form;
        return section;
    }
,isc.A.createGroupForm=function isc_CSSEditor_createGroupForm(group,values){
        values=values||this.values;
        var props=isc.addProperties({},{
                styleGroup:group,allowAsymmetry:group.allowAsymmetry,fields:[],
                extraFields:[],
                cssEditor:this,values:{}
        });
        for(var i=0;i<group.settings.length;i++){
            var name=group.settings[i];
            var s=isc.CSSEditor.getStyleSetting(group.settings[i]);
            var fValue=values&&values[name];
            var f=isc.addProperties(
                {name:s.name,editorType:s.editorType,title:s.title,width:"*",
                    settingName:s.name,allowAsymmetry:s.allowAsymmetry,styleSetting:s
                },
                group.settings[i].editorProperties
            );
            if(fValue!=null){
                f.value=fValue;
                props.values[s.name]=fValue;
            }
            if(group.showAsymmetry!=null)f.showAsymmetry=group.showAsymmetry;
            if(s.valueSuffix!=null)f.valueSuffix=s.valueSuffix;
            if(s.defaultEditorType!=null)f.defaultEditorType=s.defaultEditorType;
            if(s.returnSingleValue!=null)f.returnSingleValue=s.returnSingleValue;
            if(this.showAllSettings||(s&&s.basic!=false))props.fields.add(f);
            else props.extraFields.add(f);
        }
        var form=this.createAutoChild("sectionForm",props);
        form.setData(this.values);
        return form;
    }
,isc.A._itemChanged=function isc_CSSEditor__itemChanged(item,newValue){
        if(!this.values)return;
        this.values=isc.addProperties({},this.values,item.getCSSProperties());
        if(item.name=="opacity"&&this.values.opacity!=null){
            this.values.opacity=this.values.opacity/100;
        }
        this._valuesChanged();
    }
,isc.A._valuesChanged=function isc_CSSEditor__valuesChanged(){
        this.updatePreview();
        if(this.isDrawn()&&this.valuesChanged)this.valuesChanged(this.getCSSProperties());
    }
,isc.A.updatePreview=function isc_CSSEditor_updatePreview(){
        if(this._settingGroups)return;
        var settings=this.values;
        var handle=this.previewCanvas.getPreviewHandle();
        if(handle!=null){
            this.applyPreviewCSS(handle,settings);
        }
        this.previewCanvas.adjustForContent();
        var c=this.previewCanvas.contents;
        this.previewCanvas.setContents(c);
        this.previewLayout.adjustForContent();
    }
,isc.A.applyPreviewCSS=function isc_CSSEditor_applyPreviewCSS(handle,settings){
        for(var key in settings){
            if(settings[key]==null)continue;
            var cssKey=isc.CSSEditor.htmlAttrToCss(key);
            if(key=="radius"||key=="border-radius"){
                handle["border-radius"]=settings[key];
            }else{
                handle[key]=settings[key];
            }
        }
    }
,isc.A.draw=function isc_CSSEditor_draw(){
        this.Super("draw",arguments);
        this.updatePreview();
    }
,isc.A.getCSSProperties=function isc_CSSEditor_getCSSProperties(forceSingleValues){
        var settings={};
        for(var i=0;i<this.stack.sections.length;i++){
            var section=this.stack.sections[i];
            if(section.items[0].getCSSBlock){
                var block=section.items[0].getCSSBlock(forceSingleValues);
                isc.addProperties(settings,block);
            }
        }
        if(settings.opacity)settings.opacity=settings.opacity/100;
        return settings;
    }
,isc.A.getCSSText=function isc_CSSEditor_getCSSText(){
        var settings=this.getCSSProperties();
        var result=[];
        for(var key in settings){
            result.add(key+":"+settings[key]);
        }
        return result.join(";");
    }
);
isc.B._maxIndex=isc.C+20;

isc.defineClass("CSSEditForm","DynamicForm");
isc.A=isc.CSSEditForm.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.allowAsymmetry=true;
isc.A.showAsymmetry=false;
isc.A.width="100%";
isc.A.extraSpace=5;
isc.A.titleWidth=90;
isc.B.push(isc.A.setShowAsymmetry=function isc_CSSEditForm_setShowAsymmetry(showAsymmetry){
        this.showAsymmetry=showAsymmetry;
        this.items.map(function(item){
            if(item.allowAsymmetry&&item.setShowAsymmetry){
                item.setShowAsymmetry(showAsymmetry);
            }
        });
        this.cssEditor._valuesChanged();
    }
,isc.A.itemChanged=function isc_CSSEditForm_itemChanged(item,newValue){
        if(this._settingValue)return;
        this.cssEditor._itemChanged(item,newValue);
    }
,isc.A.getCSSBlock=function isc_CSSEditForm_getCSSBlock(forceSingleValues){
        var result={};
        for(var i=0;i<this.items.length;i++){
            var item=this.items[i];
            if(item.visible){
                var values={};
                if(item.getCSSProperties)values=item.getCSSProperties(forceSingleValues);
                else values[item.name]=item.getValue();
                isc.addProperties(result,values);
            }
        }
        return result;
    }
,isc.A.getCSSText=function isc_CSSEditForm_getCSSText(){
        var result="";
        for(var i=0;i<this.items.length;i++){
            var item=this.items[i];
            if(item.visible){
                result+=item.getCSSText();
            }
        }
        return result;
    }
);
isc.B._maxIndex=isc.C+4;

isc.defineClass("CSSEditItem","CanvasItem");
isc.A=isc.CSSEditItem.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.allowAsymmetry=null;
isc.A.showAsymmetry=false;
isc.A.colSpan="*";
isc.A.canvasConstructor="DynamicForm";
isc.A.canvasDefaults={
        titleOrientation:"top",
        numCols:4,
        colWidths:["*","*","*","*"],
        itemChanged:function(item,newValue){
            this.creator.itemChanged(item,newValue);
        }
    };
isc.A.defaultEditorType="TextItem";
isc.B.push(isc.A.createCanvas=function isc_CSSEditItem_createCanvas(){
        var props={items:this.getItemDefaults(this.name),values:{}};
        props.values[this.name]=this.value;
        this.canvas=this.createAutoChild("canvas",props);
        return this.canvas;
    }
,isc.A.setShowAsymmetry=function isc_CSSEditItem_setShowAsymmetry(showAsymmetry){
        if(this.allowAsymmetry){
            this.showAsymmetry=showAsymmetry;
            if(!showAsymmetry){
                this.canvas.items[0].setValue(this.canvas.items[1].getValue());
            }else{
                for(var i=1;i<5;i++){
                    this.canvas.items[i].setValue(this.canvas.items[0].getValue());
                }
            }
            this.canvas.redraw();
        }
    }
,isc.A.getItemDefaults=function isc_CSSEditItem_getItemDefaults(styleSetting){
        styleSetting=styleSetting||this.styleSetting;
        var s=isc.CSSEditor.getStyleSetting(styleSetting);
        if(!s)return null;
        this.allowAsymmetry=s.allowAsymmetry;
        var items=this.getEditItems(styleSetting,s)
        return items;
    }
,isc.A.getItemProps=function isc_CSSEditItem_getItemProps(name,editorType,showTitle,showItemTitles,asymmetric,editorProperties){
        var setting=isc.CSSEditor.getStyleSetting(name);
        var props=isc.addProperties({
            name:name,
            editorType:editorType,
            showTitle:showTitle,
            showItemTitles:showItemTitles,
            colSpan:"*",
            width:"*",
            asymmetric:asymmetric,
            returnSingleValue:this.returnSingleValue,
            showIf:function(){
                return this.asymmetric==this.form.creator.showAsymmetry;
            }
        },setting.editorProperties,editorProperties);
        if(this.value!=null)props.value=this.value;
        return props;
    }
,isc.A.getEditItems=function isc_CSSEditItem_getEditItems(styleSetting,section){
        var items=[
            this.getItemProps(styleSetting,this.defaultEditorType,false,false,false)
        ];
        return items;
    }
,isc.A.getCSSProperties=function isc_CSSEditItem_getCSSProperties(forceSingleValues,changesOnly){
        var result={};
        var singleValues=[];
        var changed=this.canvas.getChangedValues();
        for(var i=0;i<this.canvas.items.length;i++){
            var item=this.canvas.items[i];
            if(item.showIf()){
                if(changesOnly&&!changed[item.settingName||item.name])continue;
                var value=null;
                if(forceSingleValues&&item.returnSingleValue==false){
                    value=item.getSingleValue();
                }else{
                    value=item.getValue();
                }
                if(value==null)continue;
                if(isc.isAn.Object(value)){
                    for(var key in value){
                        var v=value[key];
                        v=this.appendValueSuffix(v);
                        singleValues.add(""+v);
                        result[key]=v;
                    }
                }else{
                    value=this.appendValueSuffix(value);
                    result[item.name]=value;
                    singleValues.add(""+value);
                }
            }
        }
        if(this.returnSingleValue){
            result={};
            result[this.name]=singleValues.join(" ");
        }
        return result;
    }
,isc.A.getSingleValue=function isc_CSSEditItem_getSingleValue(){
        return this.getValue();
    }
,isc.A.getCSSText=function isc_CSSEditItem_getCSSText(){
        var result="";
        for(var i=0;i<this.canvas.items.length;i++){
            var item=this.canvas.items[i];
            if(item.visible){
                var value=item.getValue();
                if(value==null)continue;
                value=this.appendValueSuffix(value);
                result+=item.name+":"+value+";";
            }
        }
        return result;
    }
,isc.A.itemChanged=function isc_CSSEditItem_itemChanged(item,newValue){
        var val=this.appendValueSuffix(newValue);
        this.form.creator._itemChanged(this,val);
    }
,isc.A.getCSSAttributeName=function isc_CSSEditItem_getCSSAttributeName(){
        var s=isc.CSSEditor.getStyleSetting(this.styleSetting);
        return(s?s.name:null)||this.name;
    }
,isc.A.setValue=function isc_CSSEditItem_setValue(value){
        if(value!=null){
            var cssAttr=this.getCSSAttributeName();
            if(isc.isA.String(value)){
                if(cssAttr=="padding"){
                    var cssObj=isc.CSSEditor.parseCSSSetting(cssAttr,value);
                    if(cssObj.padding.contains(" ")){
                        this.setShowAsymmetry(true);
                    }
                    value=cssObj.padding;
                }
            }
        }
        this.Super("setValue",arguments);
        this.canvas.setValue(this.name,value);
    }
,isc.A.appendValueSuffix=function isc_CSSEditItem_appendValueSuffix(value){
        if(this.valueSuffix&&this.valueSuffix!="")return value+this.valueSuffix;
        return value;
    }
);
isc.B._maxIndex=isc.C+12;

isc.defineClass("CSSBorderItem","CSSEditItem");
isc.A=isc.CSSBorderItem.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.allowSymmetry=true;
isc.A.defaultEditorType="BorderEditorItem";
isc.A.showTitle=false;
isc.A.canvasProperties={
        showItemTitles:true,
        titleOrientation:"left"
    };
isc.B.push(isc.A.getEditItems=function isc_CSSBorderItem_getEditItems(styleSetting){
        var s=isc.CSSEditor.getStyleSetting(styleSetting);
        var items=[this.getItemProps(this.name,this.defaultEditorType,true,true,false,{title:this.title})];
        if(this.allowAsymmetry&&s.asymmetricSettings){
            items.addList([
                this.getItemProps(this.name+"-top",this.defaultEditorType,true,true,true,{title:this.title+" Top"}),
                this.getItemProps(this.name+"-right",this.defaultEditorType,true,false,true,{title:"Right"}),
                this.getItemProps(this.name+"-bottom",this.defaultEditorType,true,false,true,{title:"Bottom"}),
                this.getItemProps(this.name+"-left",this.defaultEditorType,true,false,true,{title:"Left"})
            ]);
        }
        return items;
    }
,isc.A.setValue=function isc_CSSBorderItem_setValue(value){
        this._settingValue=true;
        if(value!=null){
            if(isc.isAn.Object(value)){
                if(this.allowAsymmetry&&!this.showAsymmetry&&this.setShowAsymmetry){
                    this.setShowAsymmetry(true);
                }
                this.canvas.setValues(value);
            }else{
                if(this.allowAsymmetry&&this.showAsymmetry&&this.setShowAsymmetry){
                    this.setShowAsymmetry(false);
                }
                this.canvas.setValue(this.name,value);
            }
        }
        this.Super("setValue",arguments);
        this._settingValue=false;
    }
);
isc.B._maxIndex=isc.C+2;

isc.defineClass("CSSShadowItem","CSSEditItem");
isc.A=isc.CSSShadowItem.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.allowSymmetry=false;
isc.A.defaultEditorType="ShadowEditorItem";
isc.A.showIf="return false;";
isc.B.push(isc.A.getEditItems=function isc_CSSShadowItem_getEditItems(styleSetting){
        var s=isc.CSSEditor.getStyleSetting(styleSetting);
    }
);
isc.B._maxIndex=isc.C+1;

isc.defineClass("CSSSizeItem","CSSEditItem");
isc.A=isc.CSSSizeItem.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.allowSymmetry=true;
isc.A.itemTitles=["T","R","B","L"];
isc.A.defaultEditorType="SpinnerItem";
isc.A.type="integer";
isc.A.defaultValue=0;
isc.A.valueSuffix="px";
isc.B.push(isc.A.getEditItems=function isc_CSSSizeItem_getEditItems(styleSetting){
        var s=isc.CSSEditor.getStyleSetting(styleSetting);
        var names=[styleSetting+"-top",styleSetting+"-right",styleSetting+"-bottom",styleSetting+"-left"];
        var titles=this.itemTitles.duplicate();
        if(styleSetting=="border-radius"){
            var pre="border-",
                suff="-radius";
            names=[pre+"top-left"+suff,pre+"top-right"+suff,pre+"bottom-right"+suff,pre+"bottom-left"+suff];
            titles=s.titles.duplicate();
        }
        var items=[this.getItemProps(styleSetting,this.defaultEditorType,false,false,false,
                {colSpan:1,defaultValue:this.defaultValue,valueSuffix:this.valueSuffix})];
        if(this.allowAsymmetry){
            items.addList([
                this.getItemProps(names[0],this.defaultEditorType,true,true,true,
                    {title:titles[0],titleAlign:"center",colSpan:1,
                    defaultValue:this.defaultValue,valueSuffix:this.valueSuffix}),
                this.getItemProps(names[1],this.defaultEditorType,true,true,true,
                    {title:titles[1],titleAlign:"center",colSpan:1,
                    defaultValue:this.defaultValue,valueSuffix:this.valueSuffix}),
                this.getItemProps(names[2],this.defaultEditorType,true,true,true,
                    {title:titles[2],titleAlign:"center",colSpan:1,
                    defaultValue:this.defaultValue,valueSuffix:this.valueSuffix}),
                this.getItemProps(names[3],this.defaultEditorType,true,true,true,
                    {title:titles[3],titleAlign:"center",colSpan:1,
                    defaultValue:this.defaultValue,valueSuffix:this.valueSuffix})
            ]);
        }
        return items;
    }
,isc.A.setValue=function isc_CSSSizeItem_setValue(value){
        if(value){
            var values=(""+value).split(" ");
            if(values.length==1){
                if(this.allowAsymmetry&&this.showAsymmetry&&this.setShowAsymmetry){
                    this.setShowAsymmetry(false);
                }
                var v=parseInt(values[0]);
                if((this.settingName||this.name)=="opacity")v*=100;
                this.canvas.items[0].setValue(v);
            }else{
                if(this.allowAsymmetry&&!this.showAsymmetry&&this.setShowAsymmetry){
                    this.setShowAsymmetry(true);
                }
                for(var i=0;i<4;i++){
                    this.canvas.items[i+1].setValue(parseInt(values[i]));
                }
            }
        }else{
            this.Super("setValue",arguments);
        }
    }
);
isc.B._maxIndex=isc.C+2;

isc.defineClass("GradientEditor","VLayout");
isc.A=isc.GradientEditor;
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.angleShortcuts={
        "top":"top",
        "top right":"top right",
        "right":"right",
        "bottom right":"bottom right",
        "bottom":"bottom",
        "bottom left":"bottom left",
        "left":"left",
        "top left":"top left"
    };
isc.A.originShortcuts={
        "center":"50% 50%",
        "top":"50% 0%",
        "top right":"100% 0%",
        "right":"100% 50%",
        "bottom right":"100% 100%",
        "bottom":"50% 100%",
        "bottom left":"0% 100%",
        "left":"0% 50%",
        "top left":"0% 0%"
    };
isc.A.sizeShortcuts={
        "closest-corner":"closest-corner",
        "closest-side":"closest-side",
        "farthest-corner":"farthest-corner",
        "farthest-side":"farthest-side"
    };
isc.A.directionOptions={
        "vertical":{directions:["to bottom","to top"]},
        "horizontal":{directions:["to right","to left"]},
        "diagonal":{directions:["to bottom right","to bottom left","to top left","to top right"]},
        "linear":{directions:["to bottom","to top","to right","to left",
            "to bottom right","to bottom left","to top left","to top right"]},
        "radial":{directions:["circle at center","ellipse at center"],gradientType:"radial"}
    };
isc.B.push(isc.A.allowConicGradients=function isc_c_GradientEditor_allowConicGradients(){
        return!(isc.Browser.isFirefox||isc.Browser.isIE);
    }
,isc.A.getSupportedGradientTypes=function isc_c_GradientEditor_getSupportedGradientTypes(){
        var result=["linear","radial"];
        if(isc.GradientEditor.allowConicGradients())result.add("conic");
        return result;
    }
,isc.A.getGradientString=function isc_c_GradientEditor_getGradientString(gradientObj,stops){
        var g=gradientObj;
        var result=g.type+"-gradient("
        if(g.repeating)result="repeating-"+result;
        var firstParam="";
        if(g.type=="linear"){
            if(g.angle!=null)firstParam=g.angle+"deg";
            else if(g.direction!=null)firstParam=g.direction;
        }else if(g.type=="radial"){
            if(g.shape!=null)firstParam+=g.shape+" ";
            if(g.size!=null){
                firstParam+=g.size+" ";
            }
            if(g.origin!=null){
                firstParam+="at "+g.origin;
            }else if(g.xOrigin!=null||g.yOrigin!=null){
                firstParam+="at ";
                if(g.xOrigin!=null)firstParam+=g.xOrigin+(g.xOriginType||"% ");
                if(g.yOrigin!=null)firstParam+=g.yOrigin+(g.yOriginType||"%");
            }
        }else if(g.type=="conic"){
            if(g.xOrigin!=null||g.yOrigin!=null){
                firstParam+="at ";
                if(g.xOrigin!=null)firstParam+=g.xOrigin+(g.xOriginType||"% ");
                if(g.yOrigin!=null)firstParam+=g.yOrigin+(g.yOriginType||"%");
            }
        }
        if(firstParam.length>0)firstParam+=", ";
        return result+firstParam+stops.join(", ")+")";
    }
,isc.A.parseGradientString=function isc_c_GradientEditor_parseGradientString(gradientString){
        var workStr=""+gradientString;
        var colorFuncs=workStr.match(/((rgb|rgba|hsl|hsv)\(.*?\))/g);
        if(colorFuncs){
            for(var i=0;i<colorFuncs.length;i++){
                workStr=workStr.replace(colorFuncs[i],new isc.tinycolor(colorFuncs[i]).toHex8String());
            }
        }
        var gradRegex=/((linear-gradient|repeating-linear-gradient|radial-gradient|repeating-radial-gradient|conic-gradient|repeating-conic-gradient)\(.*?\))/g;
        var gradients=workStr.match(gradRegex);
        var g={stops:[]};
        var result=""+workStr;
        var index=result.indexOf("(");
        var parts=result.substring(0,index).split("-");
        for(var i=0;i<parts.length-1;i++){
            if(parts[i]=="repeating")g.repeating=true;
            else if(parts[i]=="linear"){
                g.type="linear";
            }else if(parts[i]=="radial"){
                g.type="radial";
            }else if(parts[i]=="conic")g.type="conic";
        }
        result=result.substring(index+1);
        if(result.endsWith(")"))result=result.substring(0,result.length-1);
        var colorFuncs=result.match(/((rgb|rgba|hsl|hsv)\(.*?\))/g);
        if(colorFuncs){
            for(var i=0;i<colorFuncs.length;i++){
                result=result.replace(colorFuncs[i],new isc.tinycolor(colorFuncs[i]).toHex8());
            }
        }
        colorFuncs=null;
        var stopStrings=result.split(",");
        var firstStopIndex=0;
        for(var i=0;i<stopStrings.length;i++){
            var stopString=stopStrings[i].trim();
            var parts=stopString.split(" ");
            var tColor=new isc.tinycolor(parts[0]);
            if(!tColor.isValid()){
                if(g.type=="linear"){
                    if(parts[0].endsWith("deg")){
                        g.angle=parseInt(parts[0]);
                    }else if(stopString.startsWith("to ")){
                        g.direction=stopString;
                    }
                }else if(g.type=="radial"||g.type=="conic"){
                    g.direction=null;
                    var offset=0;
                    if(g.type=="radial"){
                        if(["circle","ellipse"].contains(parts[0])){
                            g.shape=parts[0];
                            stopString=stopString.substring(parts[0].length+1);
                        }else{
                            g.shape="circle";
                        }
                        var builtins=isc.GradientEditor.sizeShortcuts;
                        for(var key in builtins){
                            if(stopString.startsWith(builtins[key])){
                                g.size=builtins[key];
                                stopString=stopString.substring(builtins[key].length).trim();
                                break;
                            }
                        }
                    }
                    if(stopString.startsWith("at ")){
                        stopString=stopString.substring(3);
                    }
                    var origin=stopString;
                    var shortcut=isc.GradientEditor.originShortcuts[origin];
                    var isTarget=false;
                    if(!shortcut){
                        shortcut=isc.GradientEditor.sizeShortcuts[origin];
                        isTarget=shortcut!=null;
                    }
                    origin=shortcut||origin;
                    g.origin=origin;
                    if(!isTarget){
                        var xy=origin.split(" ");
                        g.xOrigin=parseInt(xy[0]);
                        if(xy[0]!=g.xOrigin)g.xOriginType=xy[0].replace(g.xOrigin,"");
                        if(xy[1]){
                            g.yOrigin=parseInt(xy[1]);
                            if(xy[1]!=g.yOrigin)g.yOriginType=xy[1].replace(g.yOrigin,"");
                        }
                    }
                }
                firstStopIndex=i+1;
                continue;
            }
            var color=tColor.toRgbString();
            var offset=parts[1]&&parts[1].length>0?parseInt(parts[1]):null;
            if(offset==null){
                if(i-firstStopIndex==0)offset=0;
                else if(i==stopStrings.length-1)offset=100;
                else{
                    offset=Math.round((100/(stopStrings.length-firstStopIndex-1))*(i-firstStopIndex));
                }
            }
            g.stops.add({offset:offset,color:color});
        }
        return g;
    }
);
isc.B._maxIndex=isc.C+4;

isc.A=isc.GradientEditor.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.width=450;
isc.A.height=120;
isc.A.canDragResize=true;
isc.A.membersMargin=10;
isc.A.defaultType="linear";
isc.A.defaultAngle=0;
isc.A.defaultShape="circle";
isc.A.defaultSize="farthest-corner";
isc.A.gradientHeight=30;
isc.A.previewHeight=200;
isc.A.templateGradients={
        "20degRWB":"linear-gradient(20deg, rgb(255, 0, 0) 0%, rgb(255, 255, 255) 50%, rgb(0, 0, 255) 100%)",
        "topRightRWB":"linear-gradient(to top right, rgb(255, 0, 0) 0%, rgb(255, 255, 255) 50%, rgb(0, 0, 255) 100%)",
        "topRightOffsetRWB":"radial-gradient(circle closest-corner at 30% 50%, rgb(255, 0, 0) 0%, rgb(255, 255, 255) 50%, rgb(0, 0, 255) 100%)",
        "radialGreen":"radial-gradient(circle at center, rgb(38, 217, 147) 0%, rgba(153, 204, 0, 0.21) 31%, rgba(32, 124, 202, 0.24) 51%, rgba(41, 137, 216, 0.33) 57%, rgb(0, 128, 0) 100%)",
        "radialGreen2":"radial-gradient(ellipse at top left, rgb(38, 217, 147) 0%, rgba(153, 204, 0, 0.21) 31%, rgba(32, 124, 202, 0.24) 51%, rgba(41, 137, 216, 0.33) 57%, rgb(0, 128, 0) 100%)",
        "radialGreen3":"radial-gradient(circle at bottom, rgb(38, 217, 147) 0%, rgba(153, 204, 0, 0.21) 31%, rgba(32, 124, 202, 0.24) 51%, rgba(41, 137, 216, 0.33) 57%, rgb(0, 128, 0) 100%)",
        "blueSomething":"linear-gradient(to bottom, rgba(30,87,153,1) 0%,rgba(39,130,207,0.1) "+
                "42%,rgba(41,137,216,0.21) 49%,rgba(32,124,202,0.24) 51%,rgba(41,137,216,0.33) 57%,rgba(125,185,232,1) 100%)",
        "blueToTransparent":"linear-gradient(to right, rgba(30,87,153,1) 0%,rgba(125,185,232,0) 100%)",
        "brownGloss":"linear-gradient(to bottom, rgba(240,183,161,1) 0%,rgba(140,51,16,1) 50%,rgba(117,34,1,1) 51%,rgba(191,110,78,1) 100%)",
        "radialColors":"radial-gradient(ellipse at 25% 70%, rgb(30, 87, 153) 0%, rgb(255, 255, 0) 28%, rgb(255, 0, 0) 42%, rgba(0, 128, 0, 0.55) 66%, rgb(125, 185, 232) 100%)",
        "conic":"conic-gradient(at 30% 50%, rgb(0, 0, 0) 0%, rgb(255, 255, 255) 50%, rgb(0, 0, 255) 100%)"
    };
isc.A.showTemplateLayout=true;
isc.A.templateLayoutDefaults={
        _constructor:"FlowLayout",
        width:"100%",
        height:46,
        overflow:"auto",
        layoutMargin:5,
        membersMargin:5,
        backgroundColor:"#ffffff",
        border:"1px solid grey",
        paddingBottom:10,
        initWidget:function(){
            this.Super("initWidget",arguments);
        },
        draw:function(){
            this.Super("draw",arguments);
            if(!this._tilesAdded)this.addGradientTiles();
        },
        addGradientTiles:function(){
            var editor=this.creator;
            var templates=editor.getTemplateGradients();
            var tiles=[];
            var props={width:24,height:24,border:"1px solid darkgrey",
                autoDraw:false,
                draw:function(){
                    this.Super("draw",arguments);
                    var handle=this.getStyleHandle();
                    if(handle)handle["background"]=this.gradient;
                },
                click:function(){
                    editor.setGradient(this.gradient);
                }
            };
            for(var key in templates){
                var p=isc.addProperties({ID:key,gradient:templates[key]},props);
                this.addTile(isc.Canvas.create(p));
            }
            p=null;
            this._tilesAdded=true;
        }
    };
isc.A.colorStopLayoutDefaults={
        _constructor:"VLayout",
        width:"100%",
        height:80,
        showResizeBar:true
    };
isc.A.colorStopBarDefaults={
        _constructor:"StopBar",
        width:"100%",
        numValues:100,
        valueField:"color",
        defaultValue:null,
        removeOnRightClick:false,
        selectOnMouseDown:true,
        stopMouseDown:function(stop){
            if(this.selectOnMouseDown)this.creator.editColorStop(stop);
        },
        stopClick:function(stop){
            if(!this.selectOnMouseDown)this.creator.editColorStop(stop);
        },
        stopAdded:function(stop){
            if(stop.getValue()==null)stop.setValue(this.defaultValue);
            if(!this._preparing){
                this.creator.editColorStop(stop);
                this.creator.updateGradient();
            }
        },
        stopUpdated:function(stop){
            if(this.editor.showEditForm)this.editor.editColorStop(stop);
            return this.Super("stopUpdated",arguments);
        },
        stopsUpdated:function(){
            this.creator.colorStopsUpdated();
        },
        getStopOutput:function(stop){
            var value=stop.getValue();
            var tc=new isc.tinycolor(stop.color);
            var result=tc.toRgbString()+" "+stop.offset+"%";
            tc=null;
            return result;
        },
        getHoverHTML:function(){
            return"Click to add a color stop";
        }
    };
isc.A.canHover=true;
isc.A.showHover=true;
isc.A.hoverMoveWithMouse=true;
isc.A.transparencySrc="[SKINIMG]GradientEditor/transparency.png";
isc.A.bodyCanvasDefaults={
        _constructor:"HLayout",
        autoDraw:false,
        width:"100%",height:50,
        overflow:"hidden",
        border:"1px solid darkgrey",
        setGradient:function(gradient){
            var handle=this.getStyleHandle()||this.getHandle();
            if(handle){
                this.imgUrl=this.imgUrl||this.editor.getTransparencyImageURL();
                handle["background-image"]=gradient+", url('"+this.imgUrl+"')";
                handle["background-repeat"]="repeat";
            }
        },
        showHover:true,
        canHover:true,
        hoverMoveWithMouse:true,
        getHoverHTML:function(){
            return"Click to add a color stop";
        },
        click:function(){
            this.editor.colorStopBar.click();
        }
    };
isc.A.thumbnailLayoutDefaults={
        _constructor:"VLayout",
        width:1,
        height:10,
        top:18,
        overflow:"visible",
        layoutMargin:0,
        membersMargin:3,
        initWidget:function(){
            this.Super("initWidget",arguments);
            this.createChildren();
        },
        destroy:function(){
            this.thumbnails=null;
            this.Super("destroy",arguments);
        },
        createChildren:function(){
            this.thumbnails=[];
            for(var i=0;i<this.thumbnailDirections.length;i++){
                var thumbnail=this.creator.getThumbnailCanvas(this.thumbnailDirections[i]);
                this.addMember(thumbnail);
            }
        },
        setThumbnailColorStops:function(stops){
            this.thumbnailColorStops=stops;
            this.members.callMethod("updateBackground");
        }
    };
isc.A.thumbnailColorStops=["black 0%","white 100%"];
isc.A.thumbnailSize=20;
isc.A.thumbnailDirections=["vertical","horizontal","diagonal","radial"];
isc.A.liveThumbnails=false;
isc.A.thumbnailDefaults={
        _constructor:"Canvas",
        border:"1px solid #202020",
        autoParent:"thumbnailLayout",
        gradientType:"linear",
        directionIndex:0,
        width:1,height:1,
        draw:function(){
            var result=this.Super("draw",arguments);
            if(!this.direction)this.direction=this.directions[this.directionIndex];
            this.updateBackground();
            return result;
        },
        updateBackground:function(){
            var handle=this.getStyleHandle();
            if(handle){
                var g=isc.GradientEditor.getGradientString(
                    {type:this.gradientType,direction:this.direction},
                    this.layout.thumbnailColorStops
                );
                handle["background-image"]=g;
            }
        },
        click:function(){
            if(this.directions.contains(this.creator.gradientObj.direction)){
                this.directionIndex++;
                if(this.directionIndex>this.directions.length-1)this.directionIndex=0;
            }
            this.direction=this.directions[this.directionIndex];
            this.updateBackground();
            this.creator.updateGradient({type:this.gradientType,direction:this.direction});
            this.handleHover();
        },
        canHover:true,
        showHover:true,
        hoverDelay:0,
        hoverMoveWithMouse:true,
        getHoverHTML:function(){
            return"Draw "+this.direction;
        }
    };
isc.A.previewLayoutDefaults={
        _constructor:"VLayout",
        width:"100%",height:1,
        layoutTopMargin:10,
        layoutBottomMargin:10,
        membersMargin:5,
        showResizeBar:true
    };
isc.A.dragSnapAngle=1;
isc.A.showPreviewCanvas=true;
isc.A.previewCanvasDefaults={
        _constructor:"Canvas",
        width:"100%",height:100,
        click:function(){
        },
        setGradient:function(gradient){
            var result=""+gradient;
            var handle=this.getStyleHandle()||this.getHandle();
            if(handle){
                if(this.editor.showTransparencyImage){
                    this.imgUrl=this.imgUrl||this.editor.getTransparencyImageURL();
                    result+=", url('"+this.imgUrl+"')";
                    handle["background-repeat"]="repeat";
                }
                handle["background-image"]=result;
            }
        },
        handleMouseDown:function(){
            this._mouseDown=isc.EH.leftButtonDown();
            return this.Super("handleMouseDown",arguments);
        },
        handleMouseMove:function(){
            if(!isc.EH.leftButtonDown()){
                delete this._mouseDown;
                delete this._movingOrigin;
            }
            if(this._mouseDown){
                this._movingOrigin=true;
                var x=Math.round(this.getOffsetX()/this.getVisibleWidth()*100),
                    y=Math.round(this.getOffsetY()/this.getVisibleHeight()*100)
                ;
                this.updateGradientOrigin(x,y);
            }
            this._newQuadrant=this.getMouseQuadrant();
            if(this._newQuadrant!=this._lastQuadrant){
                this._lastQuadrant=this._newQuadrant;
                this.updateHover();
            }
            return this.Super("handleMouseMove",arguments);
        },
        handleMouseUp:function(){
            delete this._mouseDown;
            if(this._movingOrigin){
                delete this._movingOrigin;
                return false;
            }
            return this.Super("handleMouseUp",arguments);
        },
        getMouseQuadrant:function(){
            var cWidth=this.getVisibleWidth(),
                cHeight=this.getVisibleHeight(),
                x=Math.round(this.getOffsetX()/cWidth*100),
                y=Math.round(this.getOffsetY()/cHeight*100),
                type=this.editor.gradientObj.type,
                quadrant=null
            ;
            if(x<30){
                if(y<30)quadrant="top left"
                else if(y>70)quadrant="bottom left"
                else quadrant="left";
            }else if(x>70){
                if(y<30)quadrant="top right"
                else if(y>70)quadrant="bottom right"
                else quadrant="right";
            }else if(y<30)quadrant="top";
            else if(y>70)quadrant="bottom";
            else quadrant=type=="radial"?"center":"top";
            return quadrant;
        },
        click:function(){
            this.updateGradientOrigin(null,null,true);
        },
        updateGradientOrigin:function(x,y,click){
            if(x==null)x=Math.round(this.getOffsetX()/this.getVisibleWidth()*100);
            if(y==null)y=Math.round(this.getOffsetY()/this.getVisibleHeight()*100);
            if(x!=this.originX||y!=this.originY||click){
                var form=this.editor.gradientForm;
                var quadrant=this.getMouseQuadrant();
                if(this.editor.gradientObj.type=="radial"){
                    if(!click){
                        form.setValue("xOrigin",x);
                        form.setValue("yOrigin",y);
                        this.editor.updateGradient({origin:null,direction:null,
                            xOrigin:x,yOrigin:y,shape:form.getValue("shape")
                        });
                    }else{
                        var arr=isc.GradientEditor.originShortcuts[quadrant].split(" ");
                        form.setValue("xOrigin",parseInt(arr[0]));
                        form.setValue("yOrigin",parseInt(arr[1]));
                        this.editor.updateGradient({origin:quadrant,direction:null,
                            xOrigin:parseInt(arr[0]),yOrigin:parseInt(arr[1]),
                            shape:form.getValue("shape")
                        });
                    }
                }else{
                    if(!click){
                        var angle=Math.round(Math.atan2(x-50,y-50)*(180/Math.PI));
                        angle+=180;
                        angle=360-angle;
                        angle=parseInt(angle/this.editor.dragSnapAngle)*this.editor.dragSnapAngle;
                        if(angle!=this.angle){
                            this.editor.updateGradient({angle:angle,direction:null});
                            form.setValue("angle",angle);
                            form.clearValue("direction");
                            this.angle=angle;
                        }
                    }else{
                        this.editor.updateGradient({direction:"to "+quadrant,angle:null});
                        form.clearValue("angle");
                        form.setValue("direction",quadrant);
                        this.direction="to "+quadrant;
                        this.angle=null;
                    }
                }
                this.originX=x;
                this.originY=y;
                this.updateHover();
            }
        },
        showHover:true,
        canHover:true,
        hoverMoveWithMouse:true,
        getHoverHTML:function(){
            if(this.editor.gradientObj.type=="radial"){
                if(this._movingOrigin){
                    var x=Math.round(this.getOffsetX()/this.getVisibleWidth()*100),
                        y=Math.round(this.getOffsetY()/this.getVisibleHeight()*100)
                    ;
                    return"Origin at "+x+"% / "+y+"%";
                }else{
                    return"Click for "+this.getMouseQuadrant()+" or drag to change origin";
                }
            }else{
                if(this._movingOrigin){
                    var x=Math.round(this.getOffsetX()/this.getVisibleWidth()*100),
                        y=Math.round(this.getOffsetY()/this.getVisibleHeight()*100)
                    ;
                    return"Rotate to "+this.editor.gradientForm.getValue("angle")+" degrees";
                }else{
                    return"Click for "+this.getMouseQuadrant()+" or drag to rotate";
                }
            }
            return;
        }
    };
isc.A.showAngleSlider=true;
isc.A.angleSliderConstructor="Slider";
isc.A.angleSliderDefaults={
        autoDraw:false,
        minValue:0,
        maxValue:360,
        numValues:36,
        minHeight:60,
        backgroundColor:"transparent",
        showTitle:false,
        showValue:false,
        showRange:false,
        canDragResize:false,
        canDragReposition:false,
        showActiveTrack:false,
        padding:5,
        flipValues:true,
        trackProperties:{opacity:70},
        valueChanged:function(value){
            if(!this.creator._creatingChildren){
                this.creator.updateGradient({type:"linear",angle:value});
            }
        }
    };
isc.A.showOpacityStopBar=false;
isc.A.opacityStopBarDefaults={
        _constructor:"StopBar",
        width:"100%",
        align:"bottom",
        orientation:"bottom",
        valueField:"opacity"
    };
isc.A.showColorStopForm=true;
isc.A.colorStopFormDefaults={
        _constructor:"DynamicForm",
        height:1,
        width:"100%",
        numCols:5,
        colWidths:[50,"*",80,60,70],
        items:[
            {name:"color",title:"Color",editorType:"ColorItem",width:"*",
                defaultPickerMode:"complex"
            },
            {name:"offset",title:"Position",editorType:"SpinnerItem",width:"*"},
            {name:"deleteButton",type:"button",title:"Delete",
                width:"*",startRow:false,
                click:function(){
                    this.form.removeColorStop();
                }
            }
        ],
        itemChanged:function(item,value){
            if(!this.colorStop)return;
            this.colorStop.addProperties(this.getValues());
            this.editor.stopColorChanged(this.colorStop,this.colorStop.color);
            this.editor.colorStopBar.stopUpdated(this.colorStop);
        },
        editColorStop:function(colorStop){
            this.colorStop=colorStop;
            var color=isc.tinycolor(colorStop.color);
            this.colorObj=color;
            this.setValues({color:color.toRgbString(),offset:colorStop.offset});
        },
        removeColorStop:function(){
            this.editor.colorStopBar.removeStop(this.colorStop)
            this.setValues(null);
        },
        setValues:function(values){
            var result=this.Super("setValues",arguments);
            this.setDisabled(!values||isc.isA.emptyObject(values));
            return result;
        }
    };
isc.A.showGradientForm=true;
isc.A.gradientFormDefaults={
        _constructor:"DynamicForm",
        height:1,
        width:"100%",
        numCols:8,
        colWidths:[40,60,60,40,60,40,60,60],
        titleOrientation:"top",
        items:[
            {name:"type",title:"Type",editorType:"SelectItem",width:80,
                valueMap:isc.GradientEditor.getSupportedGradientTypes(),
                defaultDynamicValue:function(){
                    return this.form.editor.defaultType;
                }
            },
            {name:"direction",title:"To",
                editorType:"SelectItem",
                width:120,
                valueMap:isc.getKeys(isc.GradientEditor.angleShortcuts),
                changed:function(){
                    if(this.getValue()==null)return;
                    this.form.clearValue("angle");
                },
                defaultDynamicValue:function(){
                    return this.form.editor.defaultDirection;
                },
                showIf:"return form.getValue('type') == 'linear';"
            },
            {name:"angle",title:"Angle",editorType:"SpinnerItem",width:60,
                min:0,max:360,
                changed:function(){
                    if(this.getValue()==null)return;
                    this.form.clearValue("direction");
                },
                defaultDynamicValue:function(){
                    return this.form.editor.defaultAngle;
                },
                showIf:"return form.getValue('type') == 'linear'"
            },
            {name:"shape",title:"Shape",
                editorType:"SelectItem",
                width:80,
                valueMap:["circle","ellipse"],
                defaultDynamicValue:function(){
                    return this.form.editor.defaultShape;
                },
                showIf:"return form.getValue('type') == 'radial'"
            },
            {name:"size",title:"Stretch to",
                editorType:"SelectItem",
                width:140,
                valueMap:isc.getKeys(isc.GradientEditor.sizeShortcuts),
                defaultDynamicValue:function(){
                    return this.form.editor.defaultSize;
                },
                showIf:"return form.getValue('type') == 'radial'"
            },
            {name:"xOrigin",title:"X%",editorType:"SpinnerItem",width:57,
                defaultValue:50,min:0,max:100,
                showIf:"return form.getValue('type') == 'radial'"
            },
            {name:"yOrigin",title:"Y%",editorType:"SpinnerItem",width:57,
                defaultValue:50,min:0,max:100,
                showIf:"return form.getValue('type') == 'radial'"
            }
        ],
        itemChanged:function(item,value){
            var values=this.getValues(),
                origin="";
            if(values.type=="linear"){
                origin=values.angle+"deg";
                if(item.name=="angle"){
                    this.editor.updateGradient({type:values.type,angle:values.angle,
                        direction:null
                    });
                }else{
                    this.editor.updateGradient({type:values.type,
                        direction:"to "+values.direction,angle:null
                    });
                }
            }else if(values.type=="radial"){
                this.editor.updateGradient({type:values.type,size:values.size,
                    xOrigin:values.xOrigin,
                    yOrigin:values.yOrigin
                });
            }
            if(item.name=="type")this.redraw();
        },
        setValues:function(values){
            var result=this.Super("setValues",arguments);
            return result;
        }
    };
isc.A.showTransparencyForm=true;
isc.A.transparencyFormDefaults={
        _constructor:"DynamicForm",
        height:1,
        width:"100%",
        numCols:1,
        colWidths:["*"],
        items:[
            {name:"showTransparencyImage",title:"Show background image (to see opacity)",
                editorType:"CheckboxItem",width:"*",
                changed:function(form,item,value){
                    form.editor.delayCall("setShowTransparencyImage",[value]);
                }
            }
        ]
    };
isc.A.showTransparencyImage=true;
isc.A.showOutputForm=true;
isc.A.outputFormDefaults={
        _constructor:"DynamicForm",
        height:1,
        width:"100%",
        numCols:2,
        colWidths:[50,"*"],
        items:[
            {name:"output",title:"CSS",editorType:"TextAreaItem",
                width:"*",colSpan:"*",height:80
            }
        ],
        clearGradient:function(){
            this.setValue("output","");
        },
        setGradient:function(gradient){
            this.setValue("output",gradient);
        }
    };
isc.A.overlayChildren=false;
isc.A.colorPickerProperties={
        defaultPickMode:"complex",
        supportsTransparency:true,
        colorChanged:function(){
            if(!this.isDrawn())return;
            var color=this.getHtmlColor();
            var c=new isc.tinycolor(color);
            c._a=this.getOpacity()/100;
            c._roundA=Math.round(100*c._a)/100;
            color=c.toRgbString();
            this.editor.stopColorChanged(this.colorStop,color);
        },
        pickerCancelled:function(){
            var stop=this.colorStop;
            this.colorStop=null;
            if(this._revertToValue==null)this.editor.colorStopBar.removeStop(stop);
            else this.editor.stopColorChanged(stop,this._revertToValue);
            this.hide();
        }
    };
isc.B.push(isc.A.allowConicGradients=function isc_GradientEditor_allowConicGradients(){
        return isc.GradientEditor.allowConicGradients();
    }
,isc.A.getTemplateGradients=function isc_GradientEditor_getTemplateGradients(){
        var templates=isc.addProperties({},this.templateGradients);
        if(!this.allowConicGradients())delete templates["conic"];
        return templates;
    }
,isc.A.getTransparencyImageURL=function isc_GradientEditor_getTransparencyImageURL(){
        if(!this.transparencyImageURL){
            this.transparencyImageURL=isc.Canvas.getImgURL(this.transparencySrc);
        }
        return this.transparencyImageURL;
    }
,isc.A.getThumbnailCanvas=function isc_GradientEditor_getThumbnailCanvas(direction){
        var p={width:this.thumbnailSize,height:this.thumbnailSize,
                  directions:isc.GradientEditor.directionOptions[direction].directions,
                  layout:this.thumbnailLayout
        };
        var type=isc.GradientEditor.directionOptions[direction].gradientType;
        if(type)p.gradientType=type;
        var newCanvas=this.createAutoChild("thumbnail",p);
        this.thumbnails.add(newCanvas);
        p=null;
        newCanvas=null;
        return this.thumbnails[this.thumbnails.length-1];
    }
,isc.A._getGradient=function isc_GradientEditor__getGradient(){
        this.colorStopStrings=this.colorStopBar.getStopStrings();
        this.gradient=isc.GradientEditor.getGradientString(this.gradientObj,
            this.colorStopStrings
        );
        return this.gradient;
    }
,isc.A.getGradient=function isc_GradientEditor_getGradient(){
        if(!this.gradient)this.gradient=this._getGradient();
        return this.gradient;
    }
,isc.A.setGradient=function isc_GradientEditor_setGradient(gradientString){
        var g=this.gradientObj=isc.GradientEditor.parseGradientString(gradientString);
        this.colorStops=g.stops;
        g=null;
        if(this.colorStopForm)this.colorStopForm.setValues(null);
        if(this.gradientForm){
            var f=this.gradientForm;
            f.setValue("type",this.gradientObj.type);
            if(this.gradientObj.type=="linear"){
                f.setValue("direction",this.gradientObj.direction);
                f.setValue("angle",this.gradientObj.angle==null?null:parseInt(this.gradientObj.angle));
            }else{
                if(this.gradientObj.type=="radial"){
                    f.setValue("shape",this.gradientObj.shape);
                    f.setValue("size",this.gradientObj.size);
                }
                f.setValue("xOrigin",parseInt(this.gradientObj.xOrigin));
                f.setValue("yOrigin",parseInt(this.gradientObj.yOrigin));
            }
            f.redraw();
        }
        this.colorStopBar.setStops(this.colorStops);
        if(this.opacityStopBar)this.opacityStopBar.setStops([]);
    }
,isc.A.updateGradient=function isc_GradientEditor_updateGradient(props){
        this.gradientObj=isc.addProperties(this.gradientObj,props);
        delete this.gradient;
        var gradStr=this.getGradient();
        if(this.bodyCanvas){
            var simpleG=isc.GradientEditor.getGradientString(
                {type:"linear",direction:"to right"},
                this.colorStopBar.getStopStrings()
            );
            this.bodyCanvas.setGradient(simpleG);
        }
        if(this.previewCanvas)this.previewCanvas.setGradient(gradStr);
        if(this.liveThumbnails&&this.thumbnailLayout){
            this.thumbnailLayout.setThumbnailColorStops(this.colorStopStrings);
        }
        if(this.showOutputForm)this.outputForm.setGradient(gradStr);
        if(this.gradientChanged)this.gradientChanged(this.gradient);
    }
,isc.A.init=function isc_GradientEditor_init(){
        if(!this.gradient){
            this.gradient=this.defaultType+"-gradient(";
            if(this.defaultType=="linear")this.gradient+=this.defaultAngle+"deg,";
            else if(this.defaultType=="radial")this.gradient+=this.defaultShape+" at 50% 50%,";
            else this.gradient+="50% 50%";
            this.gradient+="#000000, #ffffff, #0000ee)";
        }
        var g=isc.GradientEditor.parseGradientString(this.gradient);
        this.gradientObj=isc.addProperties({},g);
        this.colorStops=g.stops.duplicate();
        g=null;
        this.Super("init",arguments);
    }
,isc.A.setShowTransparencyImage=function isc_GradientEditor_setShowTransparencyImage(value){
        this.showTransparencyImage=value;
        this.previewCanvas.setGradient(this.gradient);
    }
,isc.A.initWidget=function isc_GradientEditor_initWidget(){
        this.Super("initWidget",arguments);
        this.createChildren();
    }
,isc.A.createChildren=function isc_GradientEditor_createChildren(){
        this._creatingChildren=true;
        if(this.showTemplateLayout!=false){
            this.templateLayout=this.createAutoChild("templateLayout",{editor:this});
        }
        if(this.showColorStopBar!=false){
            this.colorStopBar=this.createAutoChild("colorStopBar",{editor:this});
        }
        this.bodyCanvas=this.createAutoChild("bodyCanvas",{
            editor:this,gradient:this.gradient,height:"*",extraSpace:10
        });
        if(this.showOpacityStopBar!=false){
            this.opacityStopBar=this.createAutoChild("opacityStopBar",{opacityStops:this.opacityStops});
        }
        if(this.showColorStopForm!=false){
            this.colorStopForm=this.createAutoChild("colorStopForm",{editor:this});
        }
        var layoutHeight=this.gradientHeight+this.colorStopBar.getHeight()+30;
        this.colorStopLayout=this.createAutoChild("colorStopLayout",{
            editor:this,
            height:layoutHeight,
            minHeight:layoutHeight-this.gradientHeight+20,
            extraSpace:10,
            members:[this.colorStopBar,this.bodyCanvas,this.colorStopForm]
        });
        this.thumbnails=[];
        this.thumbnailLayout=this.createAutoChild("thumbnailLayout",{
            editor:this,
            thumbnailSize:this.thumbnailSize,
            thumbnailDirections:this.thumbnailDirections,
            thumbnailColorStops:this.thumbnailColorStops
        });
        this.angleSlider=this.createAutoChild("angleSlider");
        if(this.showGradientForm!=false){
            this.gradientForm=this.createAutoChild("gradientForm",{editor:this});
        }
        if(this.showPreviewCanvas!=false){
            this.previewCanvas=this.createAutoChild("previewCanvas",{
                editor:this,gradient:this.gradient,height:"*"
            });
            isc.Canvas.moveOffscreen(this.previewCanvas);
        }
        this.transparencyForm=this.createAutoChild("transparencyForm",{editor:this});
        this.transparencyForm.setValue("showTransparencyImage",this.showTransparencyImage);
        layoutHeight=this.previewHeight;
        if(this.gradientForm){
            isc.Canvas.moveOffscreen(this.gradientForm);
            layoutHeight+=this.gradientForm.getVisibleHeight();
        }
        if(this.transparencyForm){
            isc.Canvas.moveOffscreen(this.transparencyForm);
            layoutHeight+=this.transparencyForm.getVisibleHeight();
        }
        this.previewLayout=this.createAutoChild("previewLayout",{editor:this,
            height:layoutHeight,
            minHeight:100,
            members:[this.gradientForm,this.previewCanvas,this.transparencyForm]
        });
        isc.Canvas.moveOffscreen(this.previewLayout);
        this.previewLayout.setHeight(this.previewLayout.getVisibleHeight());
        this.previewCanvas.setHeight("*");
        if(this.showOutputForm!=false){
            this.outputForm=this.createAutoChild("outputForm",{editor:this});
        }
        this.addMembers([
            this.templateLayout,
            this.colorStopLayout,
            this.previewLayout,
            this.outputForm
        ]);
        this._creatingChildren=false;
    }
,isc.A.draw=function isc_GradientEditor_draw(){
        this.Super("draw",arguments);
        this.repositionChildren();
        this.setGradient(this.gradient);
    }
,isc.A.resized=function isc_GradientEditor_resized(){
        if(!this.isDrawn())return;
        this.repositionChildren();
    }
,isc.A.repositionChildren=function isc_GradientEditor_repositionChildren(){
    }
,isc.A.editColorStop=function isc_GradientEditor_editColorStop(stop){
        if(this.showColorStopForm){
            this.colorStopForm.editColorStop(stop);
        }else{
            this.showColorPicker(stop);
        }
    }
,isc.A.showColorPicker=function isc_GradientEditor_showColorPicker(stop){
        if(!this.colorPicker){
            var props=isc.addProperties({},this.colorPickerProperties);
            this.colorPicker=isc.ColorPicker.getSharedColorPicker(props);
        }
        var picker=this.colorPicker;
        picker.colorStop=stop;
        picker.editor=this;
        picker._revertToValue=stop.getValue();
        var rgbString=new isc.tinycolor(picker._revertToValue).toRgbString();
        picker.setColor(rgbString);
        picker.placeNear();
        picker.show();
    }
,isc.A.stopColorChanged=function isc_GradientEditor_stopColorChanged(stop,color){
        stop.setValue(color);
        stop.overlayColor=color;
        this.colorStopBar.delayCall("updateStops");
    }
,isc.A.colorStopsUpdated=function isc_GradientEditor_colorStopsUpdated(stops){
        if(!this.isDrawn())return;
        this.updateGradient();
    }
);
isc.B._maxIndex=isc.C+19;

isc.defineClass("StopBar","Canvas");
isc.A=isc.StopBar.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.height=16;
isc.A.width=200;
isc.A.padding=0;
isc.A.margin=0;
isc.A.overflow="hidden";
isc.A.canDragResize=true;
isc.A.resizeFrom=["R"];
isc.A.minValue=0;
isc.A.maxValue=100;
isc.A.numValues=100;
isc.A.stopWidth=12;
isc.A.orientation="top";
isc.A.valueField="value";
isc.A.removeOnRightClick=true;
isc.A.stopImageSrc={
        top:"[SKINIMG]GradientEditor/stopBar_stopTop.png",
        bottom:"[SKINIMG]GradientEditor/stopBar_stopBottom.png"
    };
isc.A.maxStops=0;
isc.A.canAddStops=true;
isc.A.canRemoveStops=true;
isc.A.canReorderStops=true;
isc.A.stopDefaults={
        _constructor:"Img",
        height:16,
        canHover:true,
        showHover:true,
        hoverMoveWithMouse:true,
        overlayColor:"#222222",
        showOverlay:true,
        overlayDefaults:{
            _constructor:"Canvas",
            width:"100%",height:11,
            padding:0,margin:2,
            overflow:"hidden",
            dragTarget:"parent"
        },
        initWidget:function(){
            this.Super("initWidget");
            this.addAutoChild("overlay");
        },
        getHoverHTML:function(){
            return this.creator.stopHoverHTML(this);
        },
        handleMouseDown:function(){
            this.creator.stopMouseDown(this);
            return this.Super("handleMouseDown",arguments);
        },
        handleClick:function(){
            this.creator.stopClick(this);
            return isc.EH.STOP_BUBBLING;
        },
        showContextMenu:function(){return false;},
        handleRightMouseDown:function(){
            this.creator.stopRightClick(this);
            return isc.EH.STOP_BUBBLING;
        },
        handleMouseMove:function(){
            this.handleHover();
            return isc.EH.STOP_BUBBLING;
        },
        dragAppearance:isc.EventHandler.NONE,
        dragStartDistance:0,
        canDrag:true,
        keepInParentRect:true,
        handleDragStart:function(){
            if(this.locked)return isc.EH.STOP_BUBBLING;
            this._mouseX=this.getOffsetX();
            this.handleHover();
        },
        handleDragMove:function(){
            this.setTop(0);
            var x=this.creator.getOffsetX()-this._mouseX;
            x=Math.max(0,Math.min(x,this.creator.trackLength));
            var offset=this.creator.getStopOffset(x);
            if(offset!=this.offset){
                var stops=this.creator.stops;
                var reorder=(this.prevIndex!=null&&offset<=stops[this.prevIndex].offset)||
                              (this.nextIndex!=null&&offset>=stops[this.nextIndex].offset);
                if(reorder){
                    if(!this.creator.canReorderStops)return;
                    this.creator.reorderStops();
                }
                this.offset=offset;
                this.updatePosition();
                this.creator.stopUpdated(this);
                this.updateHover();
                var pRect=this.getPageRect();
                isc.Hover.hoverCanvas.moveTo(pRect[0]+pRect[2],pRect[1]+pRect[3]);
            }
        },
        handleDragStop:function(){
            this.setTop(0);
            isc.Hover.hide();
        },
        updatePosition:function(){
            this.index=this.creator.stops.indexOf(this);
            this.prevIndex=this.index>0?this.index-1:null;
            this.nextIndex=this.index<this.creator.stops.length-1?this.index+1:null;
            this.setLeft(this.creator.getStopLeft(this));
            if(!this.isDrawn()){
                this.draw();
                this.show();
            }
            if(this.color){
                var c=isc.tinycolor(this.color).toHexString();
                this.overlayColor=c;
                c=null;
            }
            if(this.overlay)this.overlay.setBackgroundColor(this.overlayColor);
        },
        getValue:function(){
            return this[this.creator.valueField];
        },
        setValue:function(value){
            this[this.creator.valueField]=value;
            this.updatePosition();
        }
    };
isc.A.defaultStops=[
        {offset:0,color:"#000000",locked:true},
        {offset:100,color:"#ffffff",locked:true}
    ];
isc.A.defaultColor="#000000";
isc.A.showBackgroundGradient=false;
isc.A.canHover=true;
isc.A.showHover=true;
isc.A.hoverMoveWithMouse=true;
isc.B.push(isc.A.getStopImageUrl=function isc_StopBar_getStopImageUrl(){
        if(!this._stopImageUrl){
            this._stopImageUrl=isc.Canvas.getImgURL(this.stopImageSrc[this.orientation]);
        }
        return this._stopImageUrl;
    }
,isc.A.canRemoveStop=function isc_StopBar_canRemoveStop(stop){return this.canRemoveStops&&stop.canRemove!=false;}
,isc.A.getBackgroundGradient=function isc_StopBar_getBackgroundGradient(){
        if(!this.showBackgroundGradient)return null;
        if(!this.backgroundGradient){
            var direction=this.orientation=="top"?"to bottom":"to top";
            this.backgroundGradient="linear-gradient("+direction+", "+
                "rgba(255, 255, 255, .7) 0%, rgba(255, 255, 255, 0.3) 30%, transparent)";
        }
        return this.backgroundGradient;
    }
,isc.A.initWidget=function isc_StopBar_initWidget(){
        this.Super("initWidget",arguments);
        this.getBackgroundGradient();
        this.stops=[];
        this.trackLeft=0;
        this._initStopsOnDraw=true;
    }
,isc.A.draw=function isc_StopBar_draw(){
        var result=this.Super("draw",arguments);
        if(this.showBackgroundGradient){
            var handle=this.getStyleHandle();
            handle["background-image"]=this.getBackgroundGradient();
        }
        this.updateStopSize();
        if(this._initStopsOnDraw=true){
            delete this._initStopsOnDraw;
            this.setStops((this.initialStops||this.defaultStops).duplicate());
        }else{
            this.updateStops();
        }
        return result;
    }
,isc.A.resized=function isc_StopBar_resized(){
        if(!this.isDrawn())return;
        this.updateStopSize();
        if(this._preparing)return;
        this.updateStops();
    }
,isc.A.getHoverHTML=function isc_StopBar_getHoverHTML(){
        return this.getStopOffset()+" of "+this.numValues;
    }
,isc.A.mouseMove=function isc_StopBar_mouseMove(){
        this.handleHover();
    }
,isc.A.showContextMenu=function isc_StopBar_showContextMenu(){return false;}
,isc.A.click=function isc_StopBar_click(){
        this.addStop({offset:this.getStopOffset()});
    }
,isc.A.updateStopSize=function isc_StopBar_updateStopSize(){
        this.trackLength=this.getInnerWidth()-this.stopWidth;
        this.stopSize=this.trackLength/this.numValues;
    }
,isc.A.getStopOffset=function isc_StopBar_getStopOffset(left){
        if(left==null)left=this.getOffsetX();
        return Math.round(Math.min(left,this.trackLength)/this.stopSize);
    }
,isc.A.getStopLeft=function isc_StopBar_getStopLeft(stop){
        return Math.round(stop.offset*this.stopSize);
    }
,isc.A.setStops=function isc_StopBar_setStops(stops){
        this.clearStops(true);
        this._preparing=true;
        if(!stops)return;
        if(!isc.isAn.Array(stops))stops=[stops];
        for(var i=0;i<stops.length;i++){
            this.addStop(stops[i],true);
        }
        this._preparing=false;
        this.delayCall("updateStops");
    }
,isc.A.addStop=function isc_StopBar_addStop(stop,suppressNotify){
        if(!stop)return;
        if(!this.canAddStops||(this.maxStops>0&&this.stops.length>=this.maxStops))return;
        var props=isc.addProperties({src:this.getStopImageUrl(),width:this.stopWidth},stop);
        if(!props.color)props.color=this.defaultColor;
        props.bar=this;
        var newStop=this.stops.add(this.createAutoChild("stop",props));
        this.addChild(newStop);
        if(stop.locked)newStop.locked=true;
        newStop.updatePosition();
        this.reorderStops();
        if(!suppressNotify)this.stopAdded(newStop);
        return this.stops[this.stops.length-1];
    }
,isc.A.clearStops=function isc_StopBar_clearStops(suppressNotify){
        var stops=this.stops.duplicate();
        for(var i=0;i<stops.length;i++){
            this.removeStop(stops[i],true);
        }
        if(!suppressNotify)this.delayCall("updateStops")
    }
,isc.A.removeStop=function isc_StopBar_removeStop(stop,suppressNotify){
        if(!this.canRemoveStop(stop))return;
        stop.hide();
        this.stops.remove(stop);
        stop.bar=null;
        stop.prevStop=null;
        stop.nextStop=null;
        stop.destroy();
        stop=null;
        if(!suppressNotify)this.delayCall("updateStops");
    }
,isc.A.updateStops=function isc_StopBar_updateStops(){
        this.stops.callMethod("updatePosition");
        this.stopsUpdated();
    }
,isc.A.getStops=function isc_StopBar_getStops(){
        var stops=[];
        for(var i=0;i<this.stops.length;i++){
            stops.add({
                offset:this.stops[i].offset,
                value:this.stops[i].getValue(),
                locked:this.stops[i].locked
            });
        }
        return stops;
    }
,isc.A.getStopStrings=function isc_StopBar_getStopStrings(){
        var stops=[];
        for(var i=0;i<this.stops.length;i++){
            stops.add(this.getStopOutput(this.stops[i]));
        }
        return stops;
    }
,isc.A.reorderStops=function isc_StopBar_reorderStops(force){
        delete this._shouldReorderStops;
        this.stops.sortByProperty("offset",true);
    }
,isc.A.stopsUpdated=function isc_StopBar_stopsUpdated(){}
,isc.A.getStopOutput=function isc_StopBar_getStopOutput(stop){
        var value=stop.getValue();
        return stop.offset+" of "+this.numValues+(value!=null?" - "+value:"");
    }
,isc.A.stopHoverHTML=function isc_StopBar_stopHoverHTML(stop){return this.getStopOutput(stop);}
,isc.A.stopClick=function isc_StopBar_stopClick(stop){}
,isc.A.stopRightClick=function isc_StopBar_stopRightClick(stop){if(this.removeOnRightClick)this.removeStop(stop)}
,isc.A.stopAdded=function isc_StopBar_stopAdded(stop){}
,isc.A.stopUpdated=function isc_StopBar_stopUpdated(stop){this.stopsUpdated();}
);
isc.B._maxIndex=isc.C+28;

isc.defineClass("FormatEditorItem","TextItem");
isc.A=isc.FormatEditorItem;
isc.A.formatCodeHover="Open format editor";
isc.A.formatCodeNotApplicableHover="'format' property is not applicable to this field type"
;

isc.A=isc.FormatEditorItem.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.width="*";
isc.A.wrap=false;
isc.A.clipValue=true;
isc.A.disabledHover=isc.FormatEditorItem.formatCodeNotApplicableHover;
isc.A.icons=[{
        src:"[SKINIMG]actions/edit.png",
        prompt:isc.FormatEditorItem.formatCodeHover,
        disabledHover:isc.FormatEditorItem.formatCodeNotApplicableHover,
        click:"item.editFormat()"
    }];
isc.A.editorWindowConstructor="Window";
isc.A.editorWindowDefaults={
        title:"Format Editor",
        height:400,
        width:400,
        showMinimizeButton:false,
        showMaximizeButton:false,
        autoDraw:true,
        isModal:true,
        showModalMask:true,
        overflow:"visible",
        autoCenter:true,
        canDragResize:true,
        bodyProperties:{
            overflow:"visible"
        },
        closeClick:function(){
            this.items.get(0).completeEditing(true);
        }
    };
isc.A.formatEditorConstructor="NumberFormatEditor";
isc.A.formatEditorDefaults={
        showTitleField:false,
        showAutoHideCheckBox:false,
        helpWindowDefaults:{minWidth:475},
        helpTextIntro:"Editing Formats<P>"+
            "The Reify format editor allows you to define most commonly-used number and date/time "+
            "formats in an easy, Excel-like manner.  If you need something out-of-the-ordinary, "+
            "just pick the standard format nearest to what you need and modify it - again, just "+
            "like you would in Excel.",
        fireOnClose:function(){
            this.creator.userEditComplete(!this.cancelled);
        }
    };
isc.A._$dateFormatEditor="DatetimeFormatEditor";
isc.A._$numberFormatEditor="NumberFormatEditor";
isc.B.push(isc.A.init=function isc_FormatEditorItem_init(){
        if(this.getFormatEditorConstructor()==null){
            this.disabled=true;
        }
        this.Super("init",arguments);
    }
,isc.A.getEditorProperties=function isc_FormatEditorItem_getEditorProperties(){
        var properties={
            dataSource:this.form.creator.dataSource,
            dataSources:this.form.creator.dataSources,
            mathFunctions:isc.MathFunction.getDefaultFunctionNames()
        };
        if(this.targetRuleScope){
            properties.targetRuleScope=this.targetRuleScope;
            properties.localComponent=this.component;
            properties.sourceFieldColumnTitle="Field";
            properties.sourceDSColumnTitle="Source";
        }else{
            properties.component=this.component;
        }
        return properties;
    }
,isc.A.editFormat=function isc_FormatEditorItem_editFormat(){
        this.formatEditorConstructor=this.getFormatEditorConstructor();
        var isDate=this.formatEditorConstructor==this._$dateFormatEditor;
        var create;
        if(this.formatEditor==null){
            create=true;
        }else if(isDate&&isc.isA.NumberFormatEditor(this.formatEditor)||
                    !isDate&&isc.isA.DatetimeFormatEditor(this.formatEditor))
        {
            this.formatEditor.destroy();
            create=true;
        }else if(isDate&&this._actualDataType!=this.formatEditor.getActualDataType()){
            this.formatEditor.destroy();
            create=true;
        }
        if(create){
            this.formatEditor=this.createAutoChild("formatEditor",this.getEditorProperties());
            this.editorWindow=this.createAutoChild("editorWindow",{items:[this.formatEditor]});
        }
        this.editorWindow.show();
        var _this=this;
        this.formatEditor.edit(this.form.currentComponent.liveObject,this._actualDataType,
                                    function(saveValue){_this.userEditComplete(saveValue);},
                                    function(){_this.userCancelled();});
    }
,isc.A.userEditComplete=function isc_FormatEditorItem_userEditComplete(saveValue){
        this.storeValue(saveValue.format);
        this.redraw();
        this.editorWindow.clear();
    }
,isc.A.userCancelled=function isc_FormatEditorItem_userCancelled(){
        this.redraw();
        this.editorWindow.clear();
    }
,isc.A.getFormatEditorConstructor=function isc_FormatEditorItem_getFormatEditorConstructor(){
        if(!isc.ComponentEditor||!isc.isA.ComponentEditor(this.form)){
            return null;
        }
        var item=this.form.currentComponent;
        if(!isc.isA.FormItem(item.liveObject)&&item.type!="ListGridField"&&item.type!="DetailViewerField"){
            return null;
        }
        var name=item.name,
            container=window[item.parentId],
            field=(container.getItem?
                        container.getItem(name):
                        (container.getFieldByName?
                            container.getFieldByName(name):
                            container.getField(name))),
            fieldType=field.type,
            ds=container.getDataSource(),
            dsField=ds&&ds.getField(name),
            dsType=dsField?dsField.type:fieldType,
            derivedType=fieldType||dsType,
            baseType=isc.SimpleType.getBaseType(derivedType);
        delete this._actualDataType;
        if(baseType=="date"||baseType=="time"||baseType=="datetime"){
            this._actualDataType=derivedType;
            return this._$dateFormatEditor;
        }else if(baseType=="integer"||baseType=="float"){
            this._actualDataType=baseType;
            return this._$numberFormatEditor;
        }else if(baseType!=null){
            return null;
        }
        if(isc.isA.IntegerItem(field)||isc.isA.FloatItem(field)){
            this._actualDataType=isc.isA.IntegerItem(field)?"integer":"float";
            return this._$numberFormatEditor;
        }else if(isc.isA.DateItem(field)){
            this._actualDataType=isc.isA.DateTimeItem(field)?"datetime":"date";
            return this._$dateFormatEditor;
        }
        var value;
        if(isc.isA.FormItem(item)){
            value=container.getRuleContext()[item.parentId][name];
        }else if(item.type=="ListGridField"){
            var data=container.data;
            if(container.data.getAllVisibleRows){
                data=container.data.getAllVisibleRows();
            }
            if(data){
                for(var i=0;i<data.length;i++){
                    if(data[i][name]!=null){
                        value=data[i][name];
                        break;
                    }
                }
            }
        }
        if(value!=null){
            if(isc.isA.Number(value)){
                return this._$numberFormatEditor;
            }
            if(isc.isA.Date(value)){
                return this._$dateFormatEditor;
            }
            var castValue=new Number(value);
            if(castValue!==false&&!isNaN(castValue)){
                return this._$numberFormatEditor;
            }
            castValue=Date.parse(value);
            if(!isNaN(castValue)){
                return this._$dateFormatEditor;
            }
        }
        return this._$numberFormatEditor;
    }
);
isc.B._maxIndex=isc.C+6;

isc.ClassFactory.defineClass("NumberFormatEditor","VLayout");
isc.A=isc.NumberFormatEditor.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.autoDraw=false;
isc.A.width=450;
isc.A.membersMargin=10;
isc.A.standardFormatsDefaults={
        _constructor:"ListGrid",
        autoDraw:false,
        padding:10,
        autoFetchData:false,
        width:"100%",
        showFilterEditor:true,
        filterLocalData:true,
        autoFitData:"vertical",
        autoFitExtraRecords:1,
        autoFitMaxRecord:10,
        dataSource:isc.DataSource.create({
            defaultTextMatchStyle:"substring",
            _internal:true,
            fields:[
                {name:"standardFormatTitle",type:"text",title:"Category",width:"46%"},
                {name:"positiveValue",title:"Positive sample",width:"27%"},
                {name:"negativeValue",title:"Negative sample",width:"27%"}
            ]
        }),
        useAllDataSourceFields:true,
        selectionType:"single",
        selectionUpdated:function(record){
            if(record){
                if(record.standardFormatId!="custom"||!this.creator.getCustomFormat()){
                    this.creator.setFormatCode(record.standardFormat,true);
                }
                if(record.standardFormatId=="custom"&&this.creator.getCustomFormat()){
                    this.creator.setFormatCode(this.creator.getCustomFormat(),true);
                }
                if(!this.creator.ALWAYS_SHOW_FORMAT_CODE){
                    if(record.standardFormatId=="custom"){
                        this.creator.form.showItem("formatCode");
                    }else{
                        this.creator.form.hideItem("formatCode");
                    }
                }
            }
        },
        draw:function(){
            this.Super("draw",arguments);
            var _this=this;
            isc.Timer.setTimeout(function(){
                var height=_this.getVisibleHeight();
                _this.setAutoFitData(null);
                _this.setHeight(height);
                _this.setMinHeight(height);
            },500);
        }
    };
isc.A.sampleValueFormDefaults={
        _constructor:"DynamicForm",
        autoDraw:false,
        padding:10,
        wrapItemTitles:false,
        width:"60%",
        colWidths:["50%","50%"]
    };
isc.A.sampleValueLayoutDefaults={
        _constructor:"HLayout",
        autoDraw:false,
        width:"100%",
        height:1
    };
isc.A.formDefaults={
        _constructor:"DynamicForm",
        autoDraw:false,
        padding:10,
        wrapItemTitles:false,
        width:"60%",
        colWidths:["50%","50%"]
    };
isc.A.formLayoutDefaults={
        _constructor:"HLayout",
        autoDraw:false,
        width:"100%",
        height:1
    };
isc.A.sampleOutputFormDefaults={
        _constructor:"DynamicForm",
        autoDraw:false,
        padding:10,
        wrapItemTitles:false,
        width:"40%",
        isGroup:true
    };
isc.A.sampleOutputLayoutDefaults={
        _constructor:"HLayout",
        autoDraw:false,
        width:"100%",
        height:1
    };
isc.A.buttonLayoutDefaults={
        _constructor:"HLayout",
        autoDraw:false,
        width:"100%",
        height:42,
        layoutMargin:10,
        membersMargin:10,
        align:"right"
    };
isc.A.cancelButtonDefaults={
        _constructor:"IButton",
        autoDraw:false,
        title:"Cancel",
        width:75,
        autoParent:"buttonLayout",
        click:function(){
            this.creator.cancelClick();
        }
    };
isc.A.saveButtonDefaults={
        _constructor:"IButton",
        autoDraw:false,
        title:"Save",
        width:75,
        autoParent:"buttonLayout",
        click:function(){
            this.creator.saveClick();
        }
    };
isc.A.ALWAYS_SHOW_FORMAT_CODE=false;
isc.A.currencySymbols=["$","\u00A3","\u20AC","\u00A5","\u00A4"];
isc.B.push(isc.A.initWidget=function isc_NumberFormatEditor_initWidget(){
        this.Super('initWidget',arguments);
        var uiWidgetChanged=function(form,item,value){
            var code=form.creator.propertiesToCode(form.getValues());
            form.creator.standardFormats.selectionManager.deselectAll();
            form.creator.setFormatCode(code);
        };
        var editor=this;
        var fields=[
            {name:"decimalPlaces",editorType:"SpinnerItem",changed:uiWidgetChanged,
                        title:isc.NumberFormatEditor.decimalPlacesTitle,min:0,max:10},
            {name:"showSeparators",editorType:"CheckboxItem",changed:uiWidgetChanged,
                        title:isc.NumberFormatEditor.showSeparatorsTitle},
            {name:"currencySymbol",changed:uiWidgetChanged,
                        valueMap:{" ":" ","$":"$","\u00A3":"\u00A3","\u20AC":"\u20AC","\u00A5":"\u00A5",
                                    "\u00A4":isc.NumberFormatEditor.userLocaleCurrencySymbolDescription},
                        title:isc.NumberFormatEditor.currencySymbolTitle},
            {name:"currencySymbolLast",editorType:"CheckboxItem",changed:uiWidgetChanged,
                        title:isc.NumberFormatEditor.currencySymbolLastTitle},
            {name:"percentage",editorType:"CheckboxItem",changed:uiWidgetChanged,
                        title:isc.NumberFormatEditor.percentageTitle},
            {name:"negativeValues",changed:uiWidgetChanged,
                        valueMap:{"1":"-123.45","2":"- 123.45","3":"123.45-","4":"123.45 -","5":"(123.45)"},
                        title:isc.NumberFormatEditor.negativeValuesTitle},
            {name:"formatCode",title:isc.NumberFormatEditor.formatCodeTitle,changed:function(form,item,value){
                form.creator.setCustomFormat(value);
                form.creator.updateFormatUI();
            },validators:[
                            {type:"custom",condition:function(){
                                return editor.validateFormatCode();
                            },errorMessage:"Format should contain at least one '#' or '0' character to be meaningful"}
                        ],
                        hidden:!this.ALWAYS_SHOW_FORMAT_CODE}
        ];
        this.sampleValueForm=this.createAutoChild("sampleValueForm",{
            fields:[
                {name:"sampleValue",type:"float",defaultValue:1234.567,
                    title:isc.NumberFormatEditor.sampleValueTitle,width:100,
                    changed:function(form,item,value){
                        form.creator.sampleValueChanged();
                    }
                }
            ]
        });
        this.addAutoChild("sampleValueLayout");
        this.sampleValueLayout.addMember(isc.LayoutSpacer.create({width:"*"}));
        this.sampleValueLayout.addMember(this.sampleValueForm);
        this.sampleValueLayout.addMember(isc.LayoutSpacer.create({width:"*"}));
        this.addAutoChild("standardFormats");
        this.form=this.createAutoChild("form",{fields:fields});
        this.addAutoChild("formLayout");
        this.formLayout.addMember(isc.LayoutSpacer.create({width:"*"}));
        this.formLayout.addMember(this.form);
        this.formLayout.addMember(isc.LayoutSpacer.create({width:"*"}));
        this.sampleOutputForm=this.createAutoChild("sampleOutputForm",{groupTitle:isc.NumberFormatEditor.sampleOutputTitle,fields:[
            {name:"sampleOutput",editorType:"StaticTextItem",showTitle:false},
            {name:"sampleOutputNeg",editorType:"StaticTextItem",showTitle:false}
        ]});
        this.addAutoChild("sampleOutputLayout");
        this.sampleOutputLayout.addMember(isc.LayoutSpacer.create({width:"*"}));
        this.sampleOutputLayout.addMember(this.sampleOutputForm);
        this.sampleOutputLayout.addMember(isc.LayoutSpacer.create({width:"*"}));
        this.addAutoChild("buttonLayout");
        this.buttonLayout.addMember(this.createAutoChild("cancelButton"));
        this.buttonLayout.addMember(this.createAutoChild("saveButton"));
        var data=[];
        for(var i=0;i<isc.BaseNumberFormats.enumeration.length;i++){
            var key=isc.BaseNumberFormats.enumeration[i];
            data.add({
                standardFormat:isc.BaseNumberFormats[key],
                standardFormatId:key,
                standardFormatTitle:isc.BaseNumberFormats[key+"Title"]
            });
        }
        this.standardFormats.setData(data);
        this.sampleValueChanged();
    }
,isc.A.getActualDataType=function isc_NumberFormatEditor_getActualDataType(){
        return this._actualDataType;
    }
,isc.A.setActualDataType=function isc_NumberFormatEditor_setActualDataType(type){
        this._actualDataType=type;
    }
,isc.A.setFormatCode=function isc_NumberFormatEditor_setFormatCode(fmt,fromListSelection){
        this.form.getField("formatCode").setValue(fmt);
        this.updateFormatUI(fromListSelection);
    }
,isc.A.updateFormatUI=function isc_NumberFormatEditor_updateFormatUI(fromListSelection){
        var form=this.form;
        var fmt=this.form.getValue("formatCode");
        var props=this.codeToProperties(fmt);
        form.getField("decimalPlaces").setValue(props.decimalPlaces);
        form.getField("showSeparators").setValue(props.showSeparators);
        form.getField("negativeValues").setValue(props.negativeValues);
        form.getField("currencySymbol").setValue(props.currencySymbol);
        if(!props.currencySymbol||props.currencySymbol==""){
            form.getField("currencySymbolLast").setDisabled(true);
        }else{
            form.getField("currencySymbolLast").setDisabled(false);
            form.getField("currencySymbolLast").setValue(props.currencySymbolLast);
        }
        form.getField("percentage").setValue(props.percentage);
        this.formatSampleValue(fromListSelection);
    }
,isc.A.sampleValueChanged=function isc_NumberFormatEditor_sampleValueChanged(){
        this.formatSampleValue();
    }
,isc.A.formatSampleValue=function isc_NumberFormatEditor_formatSampleValue(fromListSelection){
        var fmt=this.form.getValue("formatCode");
        var sampleValue=Math.abs(this.sampleValueForm.getValue("sampleValue"));
        this.sampleOutputForm.getField("sampleOutput").setValue(isc.NumberUtil.format(sampleValue,fmt));
        this.sampleOutputForm.getField("sampleOutputNeg").setValue(isc.NumberUtil.format(-sampleValue,fmt));
        if(!fromListSelection){
            var data=this.standardFormats.getData();
            var matched=false;
            for(var i=0;i<data.length;i++){
                if(data[i].standardFormatId=="custom"){
                    var format=this.getCustomFormat()||data[i].standardFormat;
                    data[i].positiveValue=isc.NumberUtil.format(sampleValue,format);
                    data[i].negativeValue=isc.NumberUtil.format(-sampleValue,format);
                    continue;
                }
                data[i].positiveValue=isc.NumberUtil.format(sampleValue,data[i].standardFormat);
                data[i].negativeValue=isc.NumberUtil.format(-sampleValue,data[i].standardFormat);
                if(data[i].standardFormat==fmt){
                    matched=true;
                    this.standardFormats.selectionManager.deselectAll();
                    this.standardFormats.selectionManager.select(data[i]);
                    this.standardFormats.scrollToRow(i);
                }
            }
            if(!matched&&fmt&&fmt!=""){
                this.setCustomFormat(fmt);
                this.form.showItem("formatCode");
                for(var i=0;i<data.length;i++){
                    if(data[i].standardFormatId=="custom"){
                        data[i].positiveValue=isc.NumberUtil.format(sampleValue,this.getCustomFormat());
                        data[i].negativeValue=isc.NumberUtil.format(-sampleValue,this.getCustomFormat());
                        this.standardFormats.selectionManager.deselectAll();
                        this.standardFormats.selectionManager.select(data[i]);
                        this.standardFormats.scrollToRow(i);
                        break;
                    }
                }
            }else{
                this.form.hideItem("formatCode");
            }
            this.standardFormats.markForRedraw();
        }
    }
,isc.A.codeToProperties=function isc_NumberFormatEditor_codeToProperties(code){
        if(!code||code.trim()==""){
            return{};
        }
        var props={};
        props.decimalPlaces=0;
        var dp=code.indexOf(".");
        var posEnd=code.indexOf(";");
        if(posEnd==-1){
            posEnd=code.length;
        }
        if(dp!=-1){
            for(var i=dp+1;i<posEnd;i++){
                if(code.charAt(i)=="0"||code.charAt(i)=="#"){
                    props.decimalPlaces++;
                }
            }
        }else{
            dp=posEnd;
        }
        props.leadingZeroes=0;
        for(var i=0;i<dp;i++){
            if(code.charAt(i)==","){
                props.showSeparators=true;
            }else if(code.charAt(i)=="0"&&props.leadingZeroes==0){
                props.leadingZeroes=dp-i;
            }
        }
        var neg=code.substring(posEnd+1);
        if(neg.startsWith("- ")){
            props.negativeValues="2";
        }else if(neg.endsWith(" -")){
            props.negativeValues="4";
        }else if(neg.endsWith("-")){
            props.negativeValues="3";
        }else if(neg.startsWith("(")&&neg.endsWith(")")){
            props.negativeValues="5";
        }else{
            props.negativeValues="1";
        }
        var pos=code.substring(0,posEnd);
        for(var i=0;i<this.currencySymbols.length;i++){
            if(pos.startsWith(this.currencySymbols[i])){
                props.currencySymbol=this.currencySymbols[i];
                props.currencySymbolLast=false;
            }else if(pos.endsWith(this.currencySymbols[i])||pos.endsWith(this.currencySymbols[i]+"%")){
                props.currencySymbol=this.currencySymbols[i];
                props.currencySymbolLast=true;
            }
        }
        if(pos.endsWith("%")){
            props.percentage=true;
        }
        return props;
    }
,isc.A.propertiesToCode=function isc_NumberFormatEditor_propertiesToCode(props){
        if(!props||isc.isAn.emptyObject(props)){
            return"";
        }
        var code="";
        for(var i=0;i<props.leadingZeroes;i++){
            code+="0";
        }
        if(code=="")code="#";
        if(props.showSeparators)code=","+code;
        if(props.decimalPlaces>0){
            code+=".";
            for(var i=0;i<props.decimalPlaces;i++){
                code+="0";
            }
        }
        if(props.currencySymbol){
            if(!props.currencySymbolLast){
                code=props.currencySymbol+code;
            }else{
                code=code+props.currencySymbol;
            }
        }
        if(props.percentage){
            code+="%";
        }
        switch(props.negativeValues){
            case"2":
                code=code+";-"+code;
                break;
            case"3":
                code=code+";"+code+"-";
                break;
            case"4":
                code=code+";"+code+" -";
                break;
            case"5":
                code=code+";("+code+")";
                break;
            default:
        }
        return code;
    }
,isc.A.validateFormatCode=function isc_NumberFormatEditor_validateFormatCode(){
        if(!this.form.getItem("formatCode").isVisible()){
            return true;
        }
        var formatCode=this.form.getValue("formatCode");
        if(formatCode){
            return formatCode.indexOf("#")!=-1||formatCode.indexOf("0")!=-1;
        }
        return true;
    }
,isc.A.edit=function isc_NumberFormatEditor_edit(field,actualDataType,saveCallback,cancelCallback){
        if(!this.isDrawn()){
            this.delayCall("edit",arguments);
            return;
        }
        this.saveCallback=saveCallback;
        this.cancelCallback=cancelCallback;
        this.form.clearErrors(true);
        this.setActualDataType(actualDataType);
        this.form.editRecord();
        if(field.format){
            this.setFormatCode(field.format);
        }else{
            if(this._actualDataType=="float"){
                this.setFormatCode(isc.BaseNumberFormats.decimalNumber);
            }else{
                this.setFormatCode(isc.BaseNumberFormats.wholeNumber);
            }
        }
        this._initialFormatCode=this.form.getValue("formatCode");
    }
,isc.A.completeEditing=function isc_NumberFormatEditor_completeEditing(){
        this.cancelClick();
    }
,isc.A.hasChanges=function isc_NumberFormatEditor_hasChanges(){
        return this.form.getValue("formatCode")!=this._initialFormatCode;
    }
,isc.A.cancelClick=function isc_NumberFormatEditor_cancelClick(){
        if(this.hasChanges()){
            var _this=this;
            isc.ask("Cancel editing and lose your changes?",function(value){
                if(value){
                    _this._cancelClick();
                }
            });
        }else{
            this._cancelClick();
        }
    }
,isc.A._cancelClick=function isc_NumberFormatEditor__cancelClick(){
        if(this.cancelCallback){
            this.cancelCallback();
        }
        this.saveCallback=null;
        this.cancelCallback=null;
    }
,isc.A.saveClick=function isc_NumberFormatEditor_saveClick(){
        if(!this.form.validate())return;
        var saveValue={format:this.form.getValue("formatCode")};
        if(!saveValue.format){
            delete saveValue.format;
        }
        this.fireCallback(this.saveCallback,"saveValue",[saveValue]);
        this.saveCallback=null;
        this.cancelCallback=null;
    }
,isc.A.getCustomFormat=function isc_NumberFormatEditor_getCustomFormat(){
        if(!isc.NumberFormatEditor.customFormats)return null;
        return isc.NumberFormatEditor.customFormats[this._actualDataType];
    }
,isc.A.setCustomFormat=function isc_NumberFormatEditor_setCustomFormat(format){
        if(!isc.NumberFormatEditor.customFormats)isc.NumberFormatEditor.customFormats={};
        isc.NumberFormatEditor.customFormats[this._actualDataType]=format;
    }
);
isc.B._maxIndex=isc.C+18;

isc.A=isc.NumberFormatEditor;
isc.A.sampleValueTitle="Sample value to format";
isc.A.sampleOutputTitle="Formatted sample output";
isc.A.decimalPlacesTitle="Decimal places";
isc.A.showSeparatorsTitle="Show 1000 Separator";
isc.A.negativeValuesTitle="Format for negative values";
isc.A.currencySymbolTitle="Currency symbol";
isc.A.currencySymbolLastTitle="Show currency symbol last";
isc.A.percentageTitle="Percentage";
isc.A.formatCodeTitle="Format Code";
isc.A.userLocaleCurrencySymbolDescription="Symbol for user's locale (currently "+(isc.NumberUtil.currencySymbol||"$")+")"
;

isc.defineClass("BaseNumberFormats","Class");
isc.A=isc.BaseNumberFormats;
isc.A.enumeration=["wholeNumber","decimalNumber","currency","percentage","custom"];
isc.A.wholeNumber="#";
isc.A.wholeNumberTitle="Whole number";
isc.A.decimalNumber="#"+isc.NumberUtil.decimalSymbol+"00";
isc.A.decimalNumberTitle="Decimal number";
isc.A.currency=(isc.NumberUtil.currencySymbolLast?"":isc.NumberUtil.currencySymbol)+
                    "#"+isc.NumberUtil.decimalSymbol+"00"+
                    (isc.NumberUtil.currencySymbolLast?isc.NumberUtil.currencySymbol:"");
isc.A.currencyTitle="Currency amount";
isc.A.percentage="#"+isc.NumberUtil.decimalSymbol+"00%";
isc.A.percentageTitle="Percentage";
isc.A.custom="#"+isc.NumberUtil.decimalSymbol+"00";
isc.A.customTitle="Custom"
;

isc.ClassFactory.defineClass("DatetimeFormatEditor","VLayout");
isc.A=isc.DatetimeFormatEditor.getPrototype();
isc.B=isc._allFuncs;
isc.C=isc.B._maxIndex;
isc.D=isc._funcClasses;
isc.D[isc.C]=isc.A.Class;
isc.A.autoDraw=false;
isc.A.width=450;
isc.A.membersMargin=10;
isc.A.standardFormatsDefaults={
        _constructor:"ListGrid",
        autoDraw:false,
        padding:10,
        autoFetchData:false,
        width:"100%",
        showFilterEditor:true,
        filterLocalData:true,
        autoFitData:"vertical",
        autoFitExtraRecords:1,
        autoFitMaxRecords:12,
        dataSource:isc.DataSource.create({
            defaultTextMatchStyle:"substring",
            _internal:true,
            fields:[
                {name:"standardFormatTitle",type:"text",title:"Standard format",width:"55%"},
                {name:"formattedValue",title:"Formatted sample",width:"45%"}
            ]
        }),
        useAllDataSourceFields:true,
        selectionType:"single",
        selectionUpdated:function(record){
            if(record){
                if(record.standardFormatId!="custom"||!this.creator.getCustomFormat()){
                    this.creator.setFormatCode(record.standardFormat,true);
                }
                if(record.standardFormatId=="custom"&&this.creator.getCustomFormat()){
                    this.creator.setFormatCode(this.creator.getCustomFormat(),true);
                }
            }
        },
        draw:function(){
            this.Super("draw",arguments);
            var _this=this;
            isc.Timer.setTimeout(function(){
                var height=_this.getVisibleHeight();
                _this.setAutoFitData(null);
                _this.setHeight(height);
                _this.setMinHeight(height);
            },500);
        }
    };
isc.A.sampleValueFormDefaults={
        _constructor:"DynamicForm",
        autoDraw:false,
        padding:10,
        wrapItemTitles:false,
        width:"60%",
        colWidths:["50%","50%"]
    };
isc.A.sampleValueLayoutDefaults={
        _constructor:"HLayout",
        autoDraw:false,
        width:"100%",
        height:1
    };
isc.A.formDefaults={
        _constructor:"DynamicForm",
        autoDraw:false,
        padding:10,
        wrapItemTitles:false,
        width:"60%",
        colWidths:["50%","50%"]
    };
isc.A.formLayoutDefaults={
        _constructor:"HLayout",
        autoDraw:false,
        width:"100%",
        height:1
    };
isc.A.sampleOutputFormDefaults={
        _constructor:"DynamicForm",
        autoDraw:false,
        padding:10,
        wrapItemTitles:false,
        width:1,
        minWidth:145,
        numCols:1,
        isGroup:true
    };
isc.A.sampleOutputLayoutDefaults={
        _constructor:"HLayout",
        autoDraw:false,
        width:"25%",
        height:1
    };
isc.A.sampleOutputOuterLayoutDefaults={
        _constructor:"HLayout",
        autoDraw:false,
        width:"100%",
        height:1
    };
isc.A.buttonLayoutDefaults={
        _constructor:"HLayout",
        autoDraw:false,
        width:"100%",
        height:42,
        layoutMargin:10,
        membersMargin:10,
        align:"right"
    };
isc.A.cancelButtonDefaults={
        _constructor:"IButton",
        autoDraw:false,
        title:"Cancel",
        width:75,
        autoParent:"buttonLayout",
        click:function(){
            this.creator.cancelClick();
        }
    };
isc.A.saveButtonDefaults={
        _constructor:"IButton",
        autoDraw:false,
        title:"Save",
        width:75,
        autoParent:"buttonLayout",
        click:function(){
            this.creator.saveClick();
        }
    };
isc.B.push(isc.A.initWidget=function isc_DatetimeFormatEditor_initWidget(){
        this.Super('initWidget',arguments);
        var uiWidgetChanged=function(form,item,value){
            var code=form.creator.propertiesToCode(form.getValues());
            form.creator.standardFormats.selectionManager.deselectAll();
            this.setCustomFormat(code);
            form.creator.setFormatCode(code);
        };
        var editor=this;
        var fields=[
            {name:"formatCode",title:isc.DatetimeFormatEditor.formatCodeTitle,width:150,changed:function(form,item,value){
                form.creator.updateFormatUI();
            },validators:[
                {type:"custom",validateOnChange:true,condition:function(item,validator,value){
                    return editor.validateFormatCode(value,validator);
                },errorMessage:isc.DatetimeFormatEditor.generalFormatErrorMessage}
            ]}
        ];
        this.addAutoChild("sampleValueLayout");
        this.sampleValueLayout.addMember(isc.LayoutSpacer.create({width:"*"}));
        this.sampleValueLayout.addMember(isc.LayoutSpacer.create({width:"*"}));
        this.addAutoChild("standardFormats");
        this.form=this.createAutoChild("form",{fields:fields});
        this.addAutoChild("formLayout");
        this.formLayout.addMember(isc.LayoutSpacer.create({width:"*"}));
        this.formLayout.addMember(this.form);
        this.formLayout.addMember(isc.LayoutSpacer.create({width:"*"}));
        this.sampleOutputForm=this.createAutoChild("sampleOutputForm",{fields:[
            {name:"sampleOutput",editorType:"StaticTextItem",align:"center",showTitle:false,wrap:false}
        ]});
        this.sampleOutputLayout=this.createAutoChild("sampleOutputLayout",{groupTitle:isc.DatetimeFormatEditor.sampleOutputTitle});
        this.sampleOutputLayout.addMember(isc.LayoutSpacer.create({width:"*"}));
        this.sampleOutputLayout.addMember(this.sampleOutputForm);
        this.sampleOutputLayout.addMember(isc.LayoutSpacer.create({width:"*"}));
        this.addAutoChild("sampleOutputOuterLayout");
        this.sampleOutputOuterLayout.addMember(isc.LayoutSpacer.create({width:"*"}));
        this.sampleOutputOuterLayout.addMember(this.sampleOutputLayout);
        this.sampleOutputOuterLayout.addMember(isc.LayoutSpacer.create({width:"*"}));
        this.addAutoChild("buttonLayout");
        this.buttonLayout.addMember(this.createAutoChild("cancelButton"));
        this.buttonLayout.addMember(this.createAutoChild("saveButton"));
    }
,isc.A.getActualDataType=function isc_DatetimeFormatEditor_getActualDataType(){
        return this._actualDataType;
    }
,isc.A.setActualDataType=function isc_DatetimeFormatEditor_setActualDataType(type){
        if(type!=this._actualDataType){
            this._actualDataType=type;
            this.assignSampleValueEditorType();
            this.assignDefaultCustomFormat();
            this.populateStandardFormatsList();
        }
        this.sampleValueChanged();
    }
,isc.A.assignSampleValueEditorType=function isc_DatetimeFormatEditor_assignSampleValueEditorType(){
        if(this.sampleValueForm){
            this.sampleValueForm.destroy();
        }
        this.sampleValueForm=this.createAutoChild("sampleValueForm",{
            fields:[
                {name:"sampleValue",type:"text",defaultValue:new Date(),
                  title:isc.DatetimeFormatEditor.sampleValueTitle,width:150,
                  changed:function(form,item,value){
                      form.creator.sampleValueChanged();
                  },
                  useTextField:true,
                  editorType:(this._actualDataType=="time"?"TimeItem":
                                (this._actualDataType=="date"?"DateItem":"DateTimeItem"))
                }
            ]
        });
        this.sampleValueLayout.addMember(this.sampleValueForm,1);
    }
,isc.A.assignDefaultCustomFormat=function isc_DatetimeFormatEditor_assignDefaultCustomFormat(){
        if(this._actualDataType=="date"){
            this.defaultCustomFormat=isc.BaseDatetimeFormats.usShortDate;
        }else if(this._actualDataType=="time"){
            this.defaultCustomFormat=isc.BaseDatetimeFormats.hoursMinutes;
        }else{
            this.defaultCustomFormat=isc.BaseDatetimeFormats.custom;
        }
    }
,isc.A.populateStandardFormatsList=function isc_DatetimeFormatEditor_populateStandardFormatsList(){
        var data=[];
        var base;
        if(this._actualDataType=="date"){
            base=isc.BaseDatetimeFormats.dateEnum;
        }else if(this._actualDataType=="time"){
            base=isc.BaseDatetimeFormats.timeEnum;
        }else{
            base=isc.BaseDatetimeFormats.datetimeEnum;
        }
        for(var i=0;i<base.length;i++){
            var key=base[i];
            data.add({
                standardFormat:isc.BaseDatetimeFormats[key],
                standardFormatId:key,
                standardFormatTitle:isc.BaseDatetimeFormats[key+"Title"]
            });
        }
        this.standardFormats.setData(data);
    }
,isc.A.setFormatCode=function isc_DatetimeFormatEditor_setFormatCode(fmt,fromListSelection,skipUpdateUI){
        this.form.getField("formatCode").setValue(fmt);
        if(!skipUpdateUI)this.updateFormatUI(fromListSelection);
    }
,isc.A.updateFormatUI=function isc_DatetimeFormatEditor_updateFormatUI(fromListSelection){
        var form=this.form;
        var fmt=this.form.getValue("formatCode");
        this.formatSampleValue(fromListSelection);
    }
,isc.A.sampleValueChanged=function isc_DatetimeFormatEditor_sampleValueChanged(){
        this.formatSampleValue();
    }
,isc.A.formatSampleValue=function isc_DatetimeFormatEditor_formatSampleValue(fromListSelection){
        var fmt=this.form.getValue("formatCode");
        var sampleValue=this.sampleValueForm.getValue("sampleValue");
        try{
            this.sampleOutputForm.getField("sampleOutput").setValue(isc.DateUtil.format(sampleValue,fmt));
        }catch(e){}
        if(!fromListSelection){
            this.standardFormats.selectionManager.deselectAll();
            var data=this.standardFormats.getData();
            var matched=false;
            for(var i=0;i<data.length;i++){
                if(data[i].standardFormatId=="custom"){
                    var format=this.getCustomFormat();
                    try{
                        data[i].formattedValue=isc.DateUtil.format(sampleValue,format);
                    }catch(e){
                    }
                    continue;
                }
                try{
                    data[i].formattedValue=isc.DateUtil.format(sampleValue,data[i].standardFormat);
                }catch(e){}
                if(data[i].standardFormat==fmt){
                    matched=true;
                    this.standardFormats.selectionManager.select(data[i]);
                    this.standardFormats.scrollToRow(i);
                }
            }
            if(!matched&&fmt&&fmt!=""){
                this.setCustomFormat(fmt);
                for(var i=0;i<data.length;i++){
                    if(data[i].standardFormatId=="custom"){
                        try{
                            data[i].formattedValue=isc.DateUtil.format(sampleValue,this.getCustomFormat());
                        }catch(e){}
                        this.standardFormats.selectionManager.deselectAll();
                        this.standardFormats.selectionManager.select(data[i]);
                        this.standardFormats.scrollToRow(i);
                        break;
                    }
                }
            }
        }
        this.standardFormats.markForRedraw();
    }
,isc.A.codeToProperties=function isc_DatetimeFormatEditor_codeToProperties(code){
        if(!code||code.trim()==""){
            return{};
        }
        var props={};
        return props;
    }
,isc.A.propertiesToCode=function isc_DatetimeFormatEditor_propertiesToCode(props){
        if(!props||isc.isAn.emptyObject(props)){
            return"";
        }
        var code="";
        return code;
    }
,isc.A.validateFormatCode=function isc_DatetimeFormatEditor_validateFormatCode(value,validator){
        if(!this.form.getItem("formatCode").isVisible()){
            return true;
        }
        var formatCode=value||this.form.getValue("formatCode");
        if(!formatCode||formatCode.trim()==""){
            return true;
        }
        var valid=false,otherValid=false;
        if(formatCode){
            if(this._actualDataType=="time"){
                valid=this.validateTimeCode(formatCode);
                otherValid=this.validateDateCode(formatCode);
            }else if(this._actualDataType=="date"){
                valid=this.validateDateCode(formatCode);
                otherValid=this.validateTimeCode(formatCode);
            }else{
                validator.errorMessage=isc.DatetimeFormatEditor.generalFormatErrorMessage;
                return this.validateDateCode(formatCode)||this.validateTimeCode(formatCode);
            }
        }
        if(valid&&!otherValid)return true;
        if(otherValid){
            if(this._actualDataType=="time"){
                validator.errorMessage=isc.DatetimeFormatEditor.timeContainsDateFormattingErrorMessage;
            }else{
                validator.errorMessage=isc.DatetimeFormatEditor.dateContainsTimeFormattingErrorMessage;
            }
        }else{
            validator.errorMessage=isc.DatetimeFormatEditor.generalFormatErrorMessage;
        }
        return false;
    }
,isc.A.validateTimeCode=function isc_DatetimeFormatEditor_validateTimeCode(formatCode){
        var valid=false,inQuotes=false;
        for(var i=0;i<formatCode.length;i++){
            if(formatCode.charAt(i)=="'"){
                if(inQuotes){
                    inQuotes=false;
                }else{
                    var closing=formatCode.indexOf("'",i+1);
                    if(closing!=-1){
                        inQuotes=true;
                    }
                }
            }else if(!inQuotes){
                if(formatCode.charAt(i)=="H"||formatCode.charAt(i)=="h"||
                     formatCode.charAt(i)=="m"||formatCode.charAt(i)=="s"||
                     formatCode.charAt(i)=="S")
                {
                    valid=true;
                    break;
                }
            }
        }
        return valid;
    }
,isc.A.validateDateCode=function isc_DatetimeFormatEditor_validateDateCode(formatCode){
        var valid=false,inQuotes=false;
        for(var i=0;i<formatCode.length;i++){
            if(formatCode.charAt(i)=="'"){
                if(inQuotes){
                    inQuotes=false;
                }else{
                    var closing=formatCode.indexOf("'",i+1);
                    if(closing!=-1){
                        inQuotes=true;
                    }
                }
            }else if(!inQuotes){
                if(formatCode.charAt(i)=="d"||formatCode.charAt(i)=="D"||
                     formatCode.charAt(i)=="E"||
                     formatCode.charAt(i)=="w"||formatCode.charAt(i)=="C"||
                     formatCode.charAt(i)=="M"||
                     formatCode.charAt(i)=="y"||formatCode.charAt(i)=="Y"||
                     formatCode.charAt(i)=="L")
                {
                    valid=true;
                    break;
                }
            }
        }
        return valid;
    }
,isc.A.edit=function isc_DatetimeFormatEditor_edit(field,actualDataType,saveCallback,cancelCallback){
        this.saveCallback=saveCallback;
        this.cancelCallback=cancelCallback;
        this.form.clearErrors(true);
        this.form.editRecord();
        this.setActualDataType(actualDataType);
        if(field.format){
            this.setFormatCode(field.format);
        }else{
            if(this._actualDataType=="date"){
                this.setFormatCode(isc.BaseDatetimeFormats.usShortDate);
            }else if(this._actualDataType=="time"){
                this.setFormatCode(isc.BaseDatetimeFormats.hoursMinutes);
            }else{
                this.setFormatCode(isc.BaseDatetimeFormats.usShortDatetime);
            }
        }
        this._initialFormatCode=this.form.getValue("formatCode");
        this.form.validate();
    }
,isc.A.completeEditing=function isc_DatetimeFormatEditor_completeEditing(){
        this.cancelClick();
    }
,isc.A.hasChanges=function isc_DatetimeFormatEditor_hasChanges(){
        return this.form.getValue("formatCode")!=this._initialFormatCode;
    }
,isc.A.cancelClick=function isc_DatetimeFormatEditor_cancelClick(){
        if(this.hasChanges()){
            var _this=this;
            isc.ask("Cancel editing and lose your changes?",function(value){
                if(value){
                    _this._cancelClick();
                }
            });
        }else{
            this._cancelClick();
        }
    }
,isc.A._cancelClick=function isc_DatetimeFormatEditor__cancelClick(){
        if(this.cancelCallback){
            this.cancelCallback();
        }
        this.saveCallback=null;
        this.cancelCallback=null;
    }
,isc.A.saveClick=function isc_DatetimeFormatEditor_saveClick(){
        if(!this.form.validate())return;
        this._saveClick();
    }
,isc.A._saveClick=function isc_DatetimeFormatEditor__saveClick(){
        var saveValue={format:this.form.getValue("formatCode")};
        if(!saveValue.format){
            delete saveValue.format;
        }
        this.fireCallback(this.saveCallback,"saveValue",[saveValue]);
        this.saveCallback=null;
        this.cancelCallback=null;
    }
,isc.A.getCustomFormat=function isc_DatetimeFormatEditor_getCustomFormat(){
        if(!isc.DatetimeFormatEditor.customFormats||
                !isc.DatetimeFormatEditor.customFormats[this._actualDataType])
        {
            return this.defaultCustomFormat;
        }
        return isc.DatetimeFormatEditor.customFormats[this._actualDataType];
    }
,isc.A.setCustomFormat=function isc_DatetimeFormatEditor_setCustomFormat(format){
        if(!isc.DatetimeFormatEditor.customFormats)isc.DatetimeFormatEditor.customFormats={};
        isc.DatetimeFormatEditor.customFormats[this._actualDataType]=format;
    }
);
isc.B._maxIndex=isc.C+24;

isc.A=isc.DatetimeFormatEditor;
isc.A.sampleValueTitle="Sample value to format";
isc.A.sampleOutputTitle="Formatted sample output";
isc.A.formatCodeTitle="Format Code";
isc.A.generalFormatErrorMessage="Not a valid date/time format code";
isc.A.timeContainsDateFormattingErrorMessage="Format code contains date formatting, but this is a time field.  If you want to show both date and time elements, change the field type to 'datetime'";
isc.A.dateContainsTimeFormattingErrorMessage="Format code contains time formatting, but this is a date field.  If you want to show both date and time elements, change the field type to 'datetime'";
isc.A.formatLooksInvalidConfirmationMessage="This does not appear to be a valid format code.  Are you sure you want to save it?"
;

isc.defineClass("BaseDatetimeFormats","Class");
isc.A=isc.BaseDatetimeFormats;
isc.A.dateEnum=["usShortDate","europeShortDate","asiaDate","dateShortWords","dateLongWords","custom"];
isc.A.timeEnum=["hoursMinutes","hoursMinutesSeconds","fullTime","custom"];
isc.A.datetimeEnum=["usShortDatetime","europeShortDatetime","asiaDatetime","fullDatetime",
                   "usShortDate","europeShortDate","asiaDate","dateShortWords","dateLongWords",
                   "hoursMinutes","hoursMinutesSeconds","fullTime","custom"];
isc.A.usShortDate="MM/dd/yyyy";
isc.A.usShortDateTitle="US short date";
isc.A.usShortDatetime="MM/dd/yyyy HH:mm";
isc.A.usShortDatetimeTitle="US short date/time";
isc.A.europeShortDate="dd/MM/yyyy";
isc.A.europeShortDateTitle="Europe short date";
isc.A.europeShortDatetime="dd/MM/yyyy HH:mm";
isc.A.europeShortDatetimeTitle="Europe short date/time";
isc.A.asiaDate="yyyy-MM-dd";
isc.A.asiaDateTitle="China/Japan/Korea date";
isc.A.asiaDatetime="yyyy-MM-dd HH:mm";
isc.A.asiaDatetimeTitle="China/Japan/Korea date/time";
isc.A.hoursMinutes="HH:mm";
isc.A.hoursMinutesTitle="Hours and minutes";
isc.A.hoursMinutesSeconds="HH:mm:ss";
isc.A.hoursMinutesSecondsTitle="Hours, minutes and seconds";
isc.A.fullTime="HH:mm:ss.SSS";
isc.A.fullTimeTitle="Full time including milliseconds";
isc.A.dateShortWords="ddd, d MMM yyyy";
isc.A.dateShortWordsTitle="Date in words (short)";
isc.A.dateLongWords="dddd, d MMMM yyyy";
isc.A.dateLongWordsTitle="Date in words (long)";
isc.A.fullDatetime="dddd, d MMMM yyyy, HH:mm:ss.SSS";
isc.A.fullDatetimeTitle="Full long-form date/time";
isc.A.custom="MM/dd/yyyy HH:mm";
isc.A.customTitle="Custom format"
;

isc._debugModules = (isc._debugModules != null ? isc._debugModules : []);isc._debugModules.push('Tools');isc.checkForDebugAndNonDebugModules();isc._moduleEnd=isc._Tools_end=(isc.timestamp?isc.timestamp():new Date().getTime());if(isc.Log&&isc.Log.logIsInfoEnabled('loadTime'))isc.Log.logInfo('Tools module init time: ' + (isc._moduleEnd-isc._moduleStart) + 'ms','loadTime');delete isc.definingFramework;if (isc.Page) isc.Page.handleEvent(null, "moduleLoaded", { moduleName: 'Tools', loadTime: (isc._moduleEnd-isc._moduleStart)});}else{if(window.isc && isc.Log && isc.Log.logWarn)isc.Log.logWarn("Duplicate load of module 'Tools'.");}
/*

  SmartClient Ajax RIA system
  Version v13.0p_2023-09-15/EVAL Deployment (2023-09-15)

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

