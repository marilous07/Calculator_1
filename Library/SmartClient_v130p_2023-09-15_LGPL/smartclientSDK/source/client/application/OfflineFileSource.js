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
// DataSource which responds to FileSource operations using offline storage
isc.defineClass("OfflineFileSource", "DataSource");

isc.OfflineFileSource.addProperties({
    dataProtocol: "clientCustom",

    fields: [
        {name: "fileName", type: "text"},
        {name: "fileType", type: "text"},
        {name: "fileFormat", type: "text"},
        {name: "fileContents", type: "text"}
    ],

    // A prefix for the offline storage key, to distinguish from other uses
    // of offline storage.
    fileNamePrefix: "ofs-",

    // Returns all the files stored in offline storage. Note that we don't
    // cache this, at least for now, because (a) it probably doesn't take long
    // to generate it and (b) things can get removed from Offline storage if
    // capacity is exceeded, so we wouldn't know if our cache is valid.
    _getAllFiles : function () {
        var self = this;

        var fileKeys = isc.Offline.getCacheKeys().findAll(function (key) {
            return key.startsWith(self.fileNamePrefix);
        }) || [];
        
        return fileKeys.map(function (key) {
            return self.keyToFileSpec(key);
        });
    },
    
    _getFileContents : function (spec) {
        return isc.Offline.get(this.fileSpecToKey(spec));
    },

    keyToFileSpec : function (key) {
        if (key.startsWith(this.fileNamePrefix)) {
            key = key.substring(this.fileNamePrefix.length);
        }
        return isc.DataSource.makeFileSpec(key);
    },

    fileSpecToKey : function (spec) {
        return [
            this.fileNamePrefix,
            spec.fileName ? spec.fileName : "",
            spec.fileType ? "." + spec.fileType : "",
            spec.fileFormat ? "." + spec.fileFormat : ""
        ].join("");
    },

    // Note that we aren't handling versions, so we're not handling
    // getFileVersion, hasFileVersion, listFileVersions or removeFileVersion
    transformRequest : function (dsRequest) {
        var self = this;
        var response;

        switch (dsRequest.operationType) {
            case "getFile":
            case "hasFile":
            case "listFiles":
                // We just get all the files, and then let
                // getClientOnlyFetchResponse() handle the criteria and sorting
                var allFiles = this._getAllFiles();
                var result = this.getClientOnlyFetchResponse(dsRequest, allFiles);
                response = result[0] || {};
                response.data = result[1] || [];

                // For listFiles and hasFile, we're done. But for getFile, we
                // need to add the contents.
                if (dsRequest.operationType == "getFile") {
                    response.data.map(function (file) {
                        file.fileContents = self._getFileContents(file);
                    });
                }

                break;

            case "removeFile":
                var contents = this._getFileContents(dsRequest.data);
                isc.Offline.remove(this.fileSpecToKey(dsRequest.data));

                response = {
                    status: 0,
                    data: contents == null ? [] : [dsRequest.data]
                };

                break;

            case "renameFile":
                var oldSpec = dsRequest.oldValues;
                if (!oldSpec) {
                    response = {
                        status: -1,
                        data: "File to rename must be provided in oldValues"
                    };
                } else {
                    var oldContents = this._getFileContents(oldSpec);
                    if (oldContents == null) {
                        response = {
                            status: -1,
                            data: "File not found"
                        };
                    } else {
                        var newFile = this._getFileContents(dsRequest.data);
                        if (newFile != null) {
                            response = {
                                status: -1,
                                data: "destination file already exists"
                            }
                        } else {
                            try {
                                isc.Offline.put(this.fileSpecToKey(dsRequest.data), oldContents);
                                isc.Offline.remove(this.fileSpecToKey(oldSpec));
                                response = {
                                    status: 0,
                                    data: dsRequest.data
                                }
                            }
                            catch (ex) {
                                response = {
                                    status: -1,
                                    data: ex.message
                                }
                            }
                        }
                    }
                }

                break;

            case "saveFile":
                if (!dsRequest.data) {
                    response = {
                        status: -1,
                        data: "No data provided with dsRequest"
                    };
                } else if (!dsRequest.data.fileName) {
                    response = {
                        status: -1,
                        data: "fileName field must be provided"
                    };
                } else {
                    isc.Offline.put(this.fileSpecToKey(dsRequest.data), dsRequest.data.fileContents);
                    response = {
                        status: 0,
                        data: dsRequest.data
                    };
                }

                break;

            default:
                response = {
                    status: -1,
                    data: "Not implemented"
                };

                break;
        }

        // So that the processResponse() doesn't return before transformRequest() ...
        // that is, to simulate an async response
        this.delayCall("processResponse", [dsRequest.requestId, response]);

        return dsRequest.data;
    }
});
