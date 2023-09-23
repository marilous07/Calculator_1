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
//> @groupDef quartzAdapters
// Occasionally, it can be useful to provide a user interface to facilitate the management of
// background jobs. +externalLink{http://www.quartz-scheduler.org, Quartz} is a very capable job
// scheduling library but does not bundle any user interface.
// <p>
// The Scheduler tab of the
// +link{adminConsole, Admin Console} provides such a +link{QuartzManager, user interface}
// by way of +link{serverDataIntegration, server-side integration} that accepts standard fetch,
// add, update, and remove requests and translates them into the appropriate Quartz API calls.
// <p>
// Note that only cron schedules are supported at this time.
// <p>
// The Quartz*.ds.xml DataSources found in the system/datasources directory use a
// +link{declarativeSecurity, declarative security} feature
// to limit access based on the presence of a special request attribute, and could be be used
// in your own application if desired by controlling how that attribute is set.  Refer to the
// adminConsoleOperations JSP documented at +link{toolsDeployment} for detail.
//
// @title Quartz DataSources
// @requiresModules SCServer
// @visibility external
//<

//> @class QuartzManager
// A simple user interface for managing scheduled jobs via +link{group:quartzAdapters,
// Quartz DataSource} adapters, as seen in the Scheduler tab of the +link{group:adminConsole,
// Admin Console}.  Exercise caution when exposing any such feature to end users.
// @treeLocation Client Reference/Tools
// @visibility external
//<
isc.defineClass("QuartzManager", "SectionStack").addProperties({

visibilityMode: "multiple",

jobsPauseBtnDefaults: {
    _constructor: "IButton", 
    title: "Pause Job",
    prompt: "Suspends all triggers associated with selected job",
    click : function () {
        var jobsGrid = this.creator.jobsGrid;
        if (!jobsGrid.anySelected()) {
            isc.say("Please select a job first");
            return;
        }
        var job = jobsGrid.getSelectedRecord();        
        var _this = this;
        QuartzJobs.performCustomOperation("pauseJob", {group: job.group, name: job.name}, function (dsResponse) {
            _this.creator.triggersGrid.invalidateCache();
            isc.say('Job Paused');
        });
    }
},

jobsResumeBtnDefaults: {
    _constructor: "IButton", 
    title: "Resume Job",
    prompt: "Resumes all triggers associated with selected job",
    click : function () {
        var jobsGrid = this.creator.jobsGrid;
        if (!jobsGrid.anySelected()) {
            isc.say("Please select a job first");
            return;
        }
        var job = jobsGrid.getSelectedRecord();        
        var _this = this;
        QuartzJobs.performCustomOperation("resumeJob", {group: job.group, name: job.name}, function (dsResponse) {
            _this.creator.triggersGrid.invalidateCache();
            isc.say('Job Resumed');
        });
    }
},


jobsTriggerBtnDefaults: {
    _constructor: "IButton", 
    title: "Trigger Job",
    prompt: "Triggers selected job immediately",
    click : function () {
        var jobsGrid = this.creator.jobsGrid;
        if (!jobsGrid.anySelected()) {
            isc.say("Please select a job first");
            return;
        }
        var job = jobsGrid.getSelectedRecord();        
        QuartzJobs.performCustomOperation("triggerJob", {group: job.group, name: job.name}, function (dsResponse) {
            isc.say('Job Triggered');
        });
    }
},

jobsRefreshBtnDefaults: {
    _constructor: "ImgButton", 
	showRollOver: false,
    size: 16,
	src: "[SKIN]actions/refresh.png",
	prompt: "Refresh jobs",
    click : function () {
        this.creator.jobsGrid.invalidateCache();
        this.creator.triggersGrid.setData([]);
    }
},

jobsAddBtnDefaults: {
	_constructor: "ImgButton",
    size: 16,
	showRollOver: false,
	src: "[SKIN]actions/add.png",
	prompt: "Add job",
	click: "this.creator.jobsGrid.startEditingNew()"
},

jobsRemoveBtnDefaults: {
	_constructor: "ImgButton",
    size: 16,
	showRollOver: false,
	src: "[SKIN]actions/remove.png",
	prompt: "Remove job",
	click: function () {
        var _this = this;
        isc.ask("Are you sure you wish to delete the selected job?  This will remove all"
          + " triggers associated with this job.", function (yes) {
             if (yes) _this.creator.jobsGrid.removeSelectedData(function (dsResponse) {
                 _this.creator.triggersGrid.setData([]);
             });
        });
    }
},

jobsGridDefaults: {
	_constructor: "ListGrid",
	autoDraw: false,
	height: "30%",
	dataSource: "QuartzJobs",
	useAllDataSourceFields: true,
    fields: [
        {name: 'dataMap', canEdit: false, detail: true}
    ],
	autoFetchData: true,
	selectionType: "single",
    recordDoubleClick : function () {
        isc.say("The Quartz APIs do not allow modification of job metadata without destroying"
          + " all triggers attached to the job, so you must remove and re-create the job if"
          + " that's your intention");
        return;
    },
    selectionChanged : function (record, state) {
        if (state) {
            this.creator.triggersGrid.filterData({
                jobGroup: record.group,
                jobName: record.name
            });
        } else {
            this.creator.triggersGrid.setData([]);
        }
    },
    canExpandRecords: true,
    getExpansionComponent: function (record) {

        var toFieldsArray = function (map) {
            var result = [];
            for (var key in map) {
                result.add({
                    name: key
                })
            }
            return result;
        };
        var toRecordList = function (map) {
            var result = {};
            for (var key in map) {
                result[key] = map[key]
            }
            return [result];
        };

        var jobData = record.dataMap;

        if (jobData && jobData.size > 0) {
            return isc.DetailViewer.create({
                fields: toFieldsArray(jobData),
                data: toRecordList(jobData)
            });
        }
        return isc.Label.create({contents: 'No job data to display'});
    },
	remove : function() {
	}
},




triggersPauseBtnDefaults: {
    _constructor: "IButton", 
    title: "Pause Trigger",
    prompt: "Suspends selected trigger",
    click : function () {
        var triggersGrid = this.creator.triggersGrid;
        if (!triggersGrid.anySelected()) {
            isc.say("Please select a trigger first");
            return;
        }
        var trigger = triggersGrid.getSelectedRecord();        
        QuartzTriggers.performCustomOperation("pauseTrigger", {group: trigger.group, name: trigger.name}, function (dsResponse) {
            triggersGrid.invalidateCache();
            isc.say('Trigger Paused');
        });
    }
},

triggersResumeBtnDefaults: {
    _constructor: "IButton", 
    title: "Resume Trigger",
    prompt: "Resumes selected trigger",
    click : function () {
        var triggersGrid = this.creator.triggersGrid;
        if (!triggersGrid.anySelected()) {
            isc.say("Please select a trigger first");
            return;
        }
        var trigger = triggersGrid.getSelectedRecord();          
        QuartzTriggers.performCustomOperation("resumeTrigger", {group: trigger.group, name: trigger.name}, function (dsResponse) {
            triggersGrid.invalidateCache();
            isc.say('Trigger Resumed');
        });
    }
},

triggersRefreshBtnDefaults: {
    _constructor: "ImgButton", 
	showRollOver: false,
    size: 16,
	src: "[SKIN]actions/refresh.png",
	prompt: "Refresh jobs",
	click: "this.creator.triggersGrid.invalidateCache()"
},

triggersAddBtnDefaults: {
	_constructor: "ImgButton",
    size: 16,
	showRollOver: false,
	src: "[SKIN]actions/add.png",
	prompt: "Add trigger",
    click : function () {
        var jobsGrid = this.creator.jobsGrid;
        if (!jobsGrid.anySelected()) {
            isc.say("Please select a job first");
            return;
        }
        var job = jobsGrid.getSelectedRecord();
        this.creator.triggersGrid.startEditingNew({
            jobGroup: job.group,
            jobName: job.name
        });
    }
},

triggersRemoveBtnDefaults: {
	_constructor: "ImgButton",
    size: 16,
	showRollOver: false,
	src: "[SKIN]actions/remove.png",
	prompt: "Remove job",
	click: function () {
        var _this = this;
        isc.ask("Are you sure you wish to remove the selected trigger?", function (yes) {
             if (yes) _this.creator.triggersGrid.removeSelectedData(function (dsResponse) {
                 _this.creator.triggersGrid.invalidateCache();
             });
        });
    }
},

triggersGridDefaults: {
	_constructor: "ListGrid", 
    canEdit: true,
	autoDraw: false,
	selectionType: "single",
	dataSource: "QuartzTriggers",
	useAllDataSourceFields: true,
    fields: [{
	    name: 'dataMap',
        canEdit: false,
        detail: true
    }],
    canExpandRecords: true,
    getExpansionComponent: function (record) {

        var toFieldsArray = function (map) {
            var result = [];
            for (var key in map) {
                result.add({
                    name: key
                })
            }
            return result;
        };
        var toRecordList = function (map) {
            var result = {};
            for (var key in map) {
                result[key] = map[key]
            }
            return [result];
        };

        var jobData = record.dataMap;

        if (jobData && jobData.size > 0) {
            return isc.DetailViewer.create({
                fields: toFieldsArray(jobData),
                data: toRecordList(jobData)
            });
        }
        return isc.Label.create({contents: 'No job data to display'});
    },

	remove : function() {}
},


initWidget : function () {
    this.Super("initWidget", arguments);

    this.jobsPauseBtn = this.createAutoChild("jobsPauseBtn");
    this.jobsResumeBtn = this.createAutoChild("jobsResumeBtn");
    this.jobsTriggerBtn = this.createAutoChild("jobsTriggerBtn");
    this.jobsRefreshBtn = this.createAutoChild("jobsRefreshBtn");
    this.jobsAddBtn = this.createAutoChild("jobsAddBtn");
    this.jobsRemoveBtn = this.createAutoChild("jobsRemoveBtn");

    // This allows us to pass an override autoFetchData flag through. We use this on the admin
    // console in order to control when the data should be loaded as we don't want it to load
    // when the component is drawn.
    this.jobsGrid = this.createAutoChild("jobsGrid", { autoFetchData: this.autoFetchData !== false });

    this.addSection({
        title: "Jobs", 
        expanded: true, 
        items: [this.jobsGrid],
        controls: [this.jobsPauseBtn, this.jobsResumeBtn, this.jobsTriggerBtn, this.jobsRefreshBtn, this.jobsAddBtn, this.jobsRemoveBtn]
    });

    this.triggersPauseBtn = this.createAutoChild("triggersPauseBtn");    
    this.triggersResumeBtn = this.createAutoChild("triggersResumeBtn");    
    this.triggersRefreshBtn = this.createAutoChild("triggersRefreshBtn");    
    this.triggersAddBtn = this.createAutoChild("triggersAddBtn");    
    this.triggersRemoveBtn = this.createAutoChild("triggersRemoveBtn");    

    this.triggersGrid = this.createAutoChild("triggersGrid");

    this.addSection({
        title: "Triggers", 
        expanded: true, 
        items: [this.triggersGrid],
        controls: [this.triggersPauseBtn, this.triggersResumeBtn, this.triggersRefreshBtn, this.triggersAddBtn, this.triggersRemoveBtn]
    });
}

});
