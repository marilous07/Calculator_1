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

if(window.isc&&window.isc.module_Core&&!window.isc.module_ChangeLogViewer){isc.module_ChangeLogViewer=1;isc._moduleStart=isc._ChangeLogViewer_start=(isc.timestamp?isc.timestamp():new Date().getTime());if(isc._moduleEnd&&(!isc.Log||(isc.Log&&isc.Log.logIsDebugEnabled('loadTime')))){isc._pTM={message:'ChangeLogViewer load/parse time: '+(isc._moduleStart-isc._moduleEnd)+'ms',category:'loadTime'};if(isc.Log&&isc.Log.logDebug)isc.Log.logDebug(isc._pTM.message,'loadTime');else if(isc._preLog)isc._preLog[isc._preLog.length]=isc._pTM;else isc._preLog=[isc._pTM]}isc.definingFramework=true;isc.defineClass("ChangeLogViewer",isc.SectionStack);isc.defineClass("ChangeLogGrid",isc.ListGrid);isc.A=isc.ChangeLogGrid.getPrototype();isc.B=isc._allFuncs;isc.C=isc.B._maxIndex;isc.D=isc._funcClasses;isc.D[isc.C]=isc.A.Class;isc.A.showHeader=false;isc.A.canDragSelectText=true;isc.A.selectionType="none";isc.A.showRollOver=false;isc.A.dataFetchMode="local";isc.A.fixedRecordHeights=false;isc.A.wrapCells=true;isc.A.groupStartOpen="all";isc.A.groupByMaxRecords=20000;isc.B.push(isc.A.getCellVAlign=function isc_ChangeLogGrid_getCellVAlign(){return"top"});isc.B._maxIndex=isc.C+1;isc.A=isc.ChangeLogViewer.getPrototype();isc.B=isc._allFuncs;isc.C=isc.B._maxIndex;isc.D=isc._funcClasses;isc.D[isc.C]=isc.A.Class;isc.A.visibilityMode="multiple";isc.A.noChangeLogMessage="<h1>Full release notes coming soon</h1>";isc.A.noChangeLogLabelDefaults={_constructor:"Label",width:"100%",height:"100%",align:"center",valign:"top",styleName:"HeaderItem"};isc.A.filterFormDefaults={_constructor:"DynamicForm",maxHeight:80,numCols:3,colWidths:["*","*",220],autoFocus:true,items:[{name:"filterBox",editorType:"TextItem",showTitle:false,width:"*",showHintInField:true,hint:"Search change notes",changeOnKeypress:false,keyPress:function(){if(isc.EH.getKey()=="Enter"){this.updateValue();this.form.creator.filterGrids()}}},{name:"backCompatOnly",width:300,editorType:"CheckboxItem",title:"Limit to changes with back-compat notes",showTitle:false},{name:"date_time",editorType:"MiniDateRangeItem",hint:"Date Range",showTitle:false,showHintInField:true,changed:function(){this.form.creator.filterGrids()}}],itemChanged:function(_1,_2){this.creator.filterGrids()}};isc.A.featureGridDefaults={_constructor:"ChangeLogGrid"};isc.A.bugfixGridDefaults={_constructor:"ChangeLogGrid",groupByField:["change_type"]};isc.B.push(isc.A.getDataURL=function isc_ChangeLogViewer_getDataURL(_1){var _2=this.dataURLs;if(_2==null)return null;if(_1==null){_1=this.currentRelease;if(_1==null){for(var r in _2){_1=r;break}}}
return _2[_1]},isc.A.setCurrentRelease=function isc_ChangeLogViewer_setCurrentRelease(_1){this.branchDataInitialized=false;var _2=this.getDataURL();this.currentRelease=_1;var _3=this.getDataURL();if(_3!=_2){if(this.publicLogEntryDS){this.publicLogEntryDS.dataURL=_3;this.publicLogEntryDS.invalidateCache();if(this.featureGrid){this.featureGrid.invalidateCache()}
if(this.bugfixGrid){this.bugfixGrid.invalidateCache()}}}
if(_3==null){this.hideSection("filterUI");this.hideSection("featureGrid");this.hideSection("bugfixGrid");this.showSection("noChangeLogLabel")}else{this.showSection("filterUI");this.showSection("featureGrid");this.showSection("bugfixGrid");this.hideSection("noChangeLogLabel");this.filterGrids()}},isc.A.createPublicLogEntryDS=function isc_ChangeLogViewer_createPublicLogEntryDS(){this.publicLogEntryDS=isc.DataSource.create({clientOnly:true,dataURL:this.getDataURL(),$237o:true,creator:this,getClientOnlyResponse:function(_1,_2){if(this.$237o&&_1.operationType=="fetch"&&!this.creator.branchDataInitialized){this.creator.initializeBranchData(this.cacheData)}
return this.Super("getClientOnlyResponse",arguments)},fields:[{hidden:true,name:"id",primaryKey:true},{hidden:true,name:"relatedIds",multiple:true},{name:"product",type:"text"},{name:"date_time",type:"datetime"},{length:1,name:"change_type",title:"Change Type",type:"text"},{name:"category",title:"Category",type:"text"},{length:65535,name:"files",title:"Files",type:"text"},{length:65535,name:"public_notes",title:"Public Notes",type:"text"},{length:255,name:"reference",title:"Reference",type:"text"},{length:65535,name:"directory",title:"Directory",type:"text"},{name:"back_compat",type:"text"}]})},isc.A.getGridFields=function isc_ChangeLogViewer_getGridFields(){var _1=[{name:"category",showIf:function(_5,_6,_7){return false},width:100,escapeHTML:true,formatCellValue:function(_5,_6,_7,_8,_9){if(_5==null){var _2=_6.files;if(_2.length>100){_2=_2.substring(0,100)+"..."}
return _2}
return _5},getGroupValue:function(_5,_6,_7,_8,_9){if(_5==null)return _6.files;return _5}},{name:"change_type",showIf:function(_5,_6,_7){return false},width:90,formatCellValue:function(_5,_6,_7,_8,_9){if(_5!=null){if(_5.toLowerCase()=="b")return"Bug Fix";if(_5.toLowerCase()=="f")return"New Feature";if(_5.toLowerCase()=="d")return"Documentation Change"}
return"Other"},getGroupTitle:function(_5,_6,_7,_8,_9){if(_5!=null){if(_5.toLowerCase()=="b")return"Bug Fix";if(_5.toLowerCase()=="f")return"New Feature";if(_5.toLowerCase()=="d")return"Documentation Change"}
return"Other"}},{name:"date_time",showIf:"false",format:"yyyy/MM/dd",cellAlign:"center",canEdit:false},{name:"public_notes",formatCellValue:function(_5,_6,_7,_8,_9){_5=_5==null?"":_5.asHTML();if(_6.reference!=null){_5+="<i><br><br>Reference: ";var _3=_6.reference;if(!isc.isAn.Array(_3))_3=[_3];for(var i=0;i<_3.length;i++){_5+="<a target='_blank' href='"+_3[i]+"'>"+_3[i]+"</a> "}
_5+="</i>"}
if(_6.back_compat!=null){_5+="<br><br><b>Backcompat Notes:</b><br>"+_6.back_compat}
return _5}}];return _1},isc.A.filterGrids=function isc_ChangeLogViewer_filterGrids(){var _1=this.filterForm.getValues(),_2={},_3=this;var _4=[],_2;if(_1.backCompatOnly){_4.add({fieldName:"back_compat",operator:"notBlank"})}
if(_1.date_time!=null){_4.add(this.filterForm.getItem("date_time").getCriterion())}
if(_1.filterBox!=null){_4.add({operator:"or",criteria:[{fieldName:"files",operator:"iContains",value:_1.filterBox},{fieldName:"category",operator:"iContains",value:_1.filterBox},{fieldName:"public_notes",operator:"iContains",value:_1.filterBox},{fieldName:"reference",operator:"iContains",value:_1.filterBox}]})}
if(_4.length>0){_2={_constructor:"AdvancedCriteria",operator:"and",criteria:_4}}
this.featureGrid.fetchData(isc.DataSource.combineCriteria({fieldName:"change_type",operator:"iEquals",value:"f"},_2),function(_5,_6,_7){});this.bugfixGrid.fetchData(isc.DataSource.combineCriteria({_constructor:"AdvancedCriteria",operator:"and",criteria:[{fieldName:"change_type",operator:"iNotEqual",value:"f"}]},_2),function(_5,_6,_7){})},isc.A.initializeBranchData=function isc_ChangeLogViewer_initializeBranchData(_1){this.updateDatetimeField(_1);this.branchDataInitialized=true},isc.A.updateDatetimeField=function isc_ChangeLogViewer_updateDatetimeField(_1){var _2=false;if(!this.editMode&&_1!=null&&_1.getLength()>0){var _3=_1.get(0);if(_3.date_time!=null){_2=true}}
if(_2){this.featureGrid.showField("date_time");this.bugfixGrid.showField("date_time");this.filterForm.showField("date_time")}else{this.featureGrid.hideField("date_time");this.bugfixGrid.hideField("date_time");this.filterForm.hideField("date_time")}},isc.A.initWidget=function isc_ChangeLogViewer_initWidget(){var _1=this;this.createPublicLogEntryDS();this.noChangeLogLabel=this.createAutoChild("noChangeLogLabel");this.noChangeLogLabel.setContents(this.noChangeLogMessage);this.filterForm=this.createAutoChild("filterForm");this.featureGrid=this.createAutoChild("featureGrid",{dataSource:this.publicLogEntryDS,fields:this.getGridFields()});this.bugfixGrid=this.createAutoChild("bugfixGrid",{dataSource:this.publicLogEntryDS,fields:this.getGridFields()});var _2=this.getDataURL(),_3=_2==null;this.sections=[{ID:"noChangeLogLabel",hidden:!_3,showHeader:false,items:[this.noChangeLogLabel]},{ID:"filterUI",hidden:_3,items:[isc.LayoutSpacer.create({height:10,maxHeight:10}),this.filterForm],showHeader:false,expanded:true},{ID:"featureGrid",hidden:_3,title:"New Features",items:[this.featureGrid],controls:[isc.GridTotalRowsIndicator.create({contents:"Total Features: ${this.rowCount}",grid:this.featureGrid})],expanded:true},{ID:"bugfixGrid",hidden:_3,title:"Bug Fixes and other Changes",items:[this.bugfixGrid],controls:[isc.GridTotalRowsIndicator.create({contents:"Total Bug Fixes: ${this.rowCount}",grid:this.bugfixGrid})],expanded:true}]
this.Super("initWidget",arguments);if(!_3)this.filterGrids()});isc.B._maxIndex=isc.C+8;isc._nonDebugModules=(isc._nonDebugModules!=null?isc._nonDebugModules:[]);isc._nonDebugModules.push('ChangeLogViewer');isc.checkForDebugAndNonDebugModules();isc._moduleEnd=isc._ChangeLogViewer_end=(isc.timestamp?isc.timestamp():new Date().getTime());if(isc.Log&&isc.Log.logIsInfoEnabled('loadTime'))isc.Log.logInfo('ChangeLogViewer module init time: '+(isc._moduleEnd-isc._moduleStart)+'ms','loadTime');delete isc.definingFramework;if(isc.Page)isc.Page.handleEvent(null,"moduleLoaded",{moduleName:'ChangeLogViewer',loadTime:(isc._moduleEnd-isc._moduleStart)});}else{if(window.isc&&isc.Log&&isc.Log.logWarn)isc.Log.logWarn("Duplicate load of module 'ChangeLogViewer'.");}
