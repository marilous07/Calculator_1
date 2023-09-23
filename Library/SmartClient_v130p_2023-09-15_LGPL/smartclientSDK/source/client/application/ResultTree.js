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
//> @groupDef treeDataBinding
// 
// The SmartClient +link{TreeGrid} component is a visual representation of a tree and requires
// a +link{Tree} or +link{ResultTree} datatype passed via the +link{TreeGrid.data} attribute to
// initialize the tree view.  The +link{Tree} datatype is used when you want to provide all of
// the tree nodes in one shot at initialization time.  The +link{ResultTree} datatype is used
// when you want portions of the tree to be loaded on demand from the server.
// <p>
// <h3>Providing all data to the Tree at creation</h3>
// <p>
// The simplest mechanism by which to initialize a Tree is to simply provide all the data
// up-front when the Tree itself is created.  Depending on the format of your tree data, this
// can be done by setting +link{Tree.root} or +link{Tree.data}.  This functionality is provided
// by the +link{Tree} class.
// <p>
// For examples of this type of databinding, see the following SDK examples:
// <ul>
// <li>+explorerExample{childrenArrays, TreeGrid Initialization Example}</li>
// <smartclient>
// <li>+externalLink{/examples/server_integration/#jstlTree, TreeGrid Initialization with JSTL}</li>
// </smartclient>
// </ul>
// <p>
// <h3>Loading Tree nodes on demand</h3>
// <p>
// In this mode, tree nodes are loaded on-demand the first time a user expands a folder.  This
// approach is necessary for large trees.  This functionality is provided by the
// +link{ResultTree} class, which uses a +link{DataSource} to load data from the server.  Each
// DataSource Record becomes a +link{TreeNode}.
// <p>
// When the user expands a folder whose children have not yet been loaded
// from the server (or you programmatically call openFolder() on such a node), the client
// automatically sends a +link{DSRequest} to the server to ask for all immediate children of
// that node.  
// <P>
// If you have a dataset that is +link{TreeModelType,"parent-linked"}, that is, every node has
// a unique ID (the +link{tree.idField}) and also has a property with the unique ID of it's
// parent node (the +link{tree.parentIdField}) the tree can load child nodes by simply sending
// a DSRequest with appropriate +link{Criteria}.  Given a parent node with ID "225" in a tree
// where the +link{tree.parentIdField} is called "parentId", the criteria would be:
// <pre>
//    { parentId : 225 }
// </pre>
// The client is asking the server: "give me all nodes whose parentId is 225", which are the
// children of node 225.  
// <P>
// If you have a DataSource that supports simple +link{Criteria} like the above, and your
// records have nodes with ids and parentIds, this strategy can be used by just declaring the
// tree relationship in your DataSource: the first +link{DataSourceField.foreignKey} field
// referring to another field in that same DataSource will be taken as the
//+link{Tree.parentIdField}, and the field to which it refers, the +link{Tree.idField}.  You
// can use the +link{DataSourceField.primaryKey} field as your +link{Tree.idField}, but it's
// only required that it hold unique values.  Note, this only works for DataSources with  a
// single primaryKey field; composite keys are not supported for this kind of tree databinding.
// See +link{dataSourceField.primaryKey} for more details.
// <P>
// If you have a tree where there is no convenient unique ID, for example, you have mixed types
// of nodes (for example, departments and employees), use one of the following approaches:
// <ol>
// <li> generate a synthetic node ID and return it with every tree node.
// <P>
// Typically two or more properties can be combined into a String that serves as a unique ID.
// For example, if you are loading a mixed tree of "Departments" and "Users", each of which
// have unique numeric IDs, you could generate synthetic node IDs like "department:353" and
// "user:311".  Your server-side code will then receive these synthetic node IDs when the tree
// loads children, and you can parse the IDs, look up the appropriate object and return its
// child nodes.
// <P>
// In the case of filesystems or XML documents, you can use the full path to the file or XML
// element as the unique ID.
// <P>
// <li> have all properties of the parentNode +link{DataSource.sendParentNode,sent to the server}
// <P>
// If having all the properties of the parentNode would allow you to look up children, this
// approach may be more convenient than having to generate synthetic node IDs and parse them
// when looking up children.
// <P>
// For example, with a mixed-type tree, your server-side code may be able to quickly identify
// the type of the parent node be looking for specific properties, and then call methods to
// look up children for that type of node.
// <P>
// In this case there is no need to declare an idField or parentIdField.
// </ol>
// <P>
// +link{ResultTree}s are created for you by the +link{TreeGrid} when you set
// +link{TreeGrid.dataSource}, but you can pass an initial dataset to a databound TreeGrid by
// setting +link{TreeGrid.initialData}.
// <P>
// If you do not provide +link{TreeGrid.initialData}, the first DSRequest you receive will be a
// request for the nodes under root.  The id of the root node of the tree is the value of the
// <code>rootValue</code> attribute on the +link{Tree.parentIdField} of the Tree DataSource. 
// <p>
// For examples of this type of databinding, see the following SDK examples:
// <ul>
// <li>+explorerExample{initialData, TreeGrid DataBinding Example}</li>
// <smartclient>
// <li>+externalLink{/examples/server_integration/#xml2JSLOD, TreeGrid XML DataBinding}
// </smartclient>
// </ul>
// <P>
// <h4>Folders and load on demand</h4>
// <P>
// When using load on demand, the Tree cannot simply check whether a node has children to
// determine whether it's a folder, and will assume all loaded nodes are folders.  To avoid
// this, you can add a boolean field to your DataSource called "isFolder" that indicates
// whether a node is a folder or not.  If you already have a boolean field that indicates
// whether a node is a folder, you can instead set +link{tree.isFolderProperty} to the name of
// that field via +link{TreeGrid.dataProperties}.
// <P>
// <h4>Multi-Level load on demand</h4>
// <P>
// The ResultTree's DSRequests ask for the immediate children of a node only (by specifying
// <code>parentId</code> in the criteria). Any nodes returned whose <code>parentId</code> field
// value is unset or matches this criterion will be added to the tree as immediate children of the
// node. However you are also free to return multiple levels of children.  This can be done by
// simply returning a flat list of descendents with valid id's and parentId's, exactly as though 
// you were initializing a multi-level tree via +link{Tree.data}.  
// <P>
// Note that when receiving multiple levels of children, the ResultTree's assumption is that
// if any children are loaded for a parent, then that parent is considered fully loaded.
// <P>
// When loading children for a given parent node, the ResultTree calls
// +link{DataSource.fetchData} on its DataSource.  For custom code that may need to reference
// the parentNode or tree in some way, the parent node whose children are being loaded is
// available on the dsRequest instance in the DataSource flow as dsRequest.parentNode, where it
// can be inspected during +link{DataSource.transformRequest()}.
// <P>
// For an example of this feature, see the following SDK example:
// <ul>
// <li>+explorerExample{multiLevelLOD,Multi-Level Load on Demand Example}</li>
// </ul>
// <P>
// <h3>Paging large sets of children</h3>
// <p>
// If some nodes in your tree have a very large number of immediate children, you can enable
// +link{resultTree.fetchMode,fetchMode:"paged"} to load children in batches.  This means that
// whenever the children of a folder are loaded, the <code>ResultTree</code> will set
// +link{dsRequest.startRow} and +link{dsRequest.endRow,endRow} when requesting children from
// the DataSource.  This includes the initial fetch of top-level nodes, which are children of
// the +link{tree.showRoot,implicit root node}.
// <p>
// As with all paged DSRequests, the server is free to ignore startRow/endRow and
// simply return all children of the node.  This allows the server to make on-the-fly
// folder-by-folder choices as to whether to use paging or just return all children.  However,
// whenever the server returns only some children, the server must provide an accurate value for
// +link{dsResponse.totalRows}.  Note that <code>startRow</code>, <code>endRow</code>, and 
// <code>totalRows</code> all refer to the array of siblings that are the direct children of a
// particular parent node (specified by the criteria or, implicitly, the root node).
// In particular, <code>totalRows</code> is a count of exactly how many nodes match the
// criteria; this is the same as how many total sibling children are available at that level.
// <p>
// If the server does return a partial list of children, the <code>ResultTree</code>. will
// create a +link{ResultSet} to represent it rather than an array, and automatically request
// further children as they are accessed; typically this happens because the user is scrolling
// around in a +link{TreeGrid} which is viewing the <code>ResultTree</code>.  The value of 
// +link{ResultTree.resultSize} (which may be overridden via +link{ListGrid.dataPageSize,dataPageSize}) will
// be passed along to any created <code>ResultSet</code> as well as used directly for the
// initial server request for a node's children.
// <p>
// In this mode, the server may return multiple levels of the tree as described above
// ("Multi-Level load on demand"), however, by default the server is not allowed to return
// folders that are open, as this creates a potential performance issue: consider the case of a
// user scrolling rapidly into an unloaded area of the tree, skipping past many nodes that have
// not been loaded.  If the skipped nodes might have been open parents, then the only way to
// know what nodes should be visible at the new scroll position is to load all skipped nodes
// and discover how many visible children they had.
// <p>
// If this performance consequence is acceptable, the restriction against returning open
// folders from the server may be lifted on a tree-wide basis by setting the
// +link{resultTree.canReturnOpenFolders,canReturnOpenFolders} property to <code>true</code>
// and/or on a folder-by-folder basis by setting the property named by the
// +link{resultTree.canReturnOpenSubfoldersProperty,canReturnOpenSubfoldersProperty} to
// <code>true</code>.  In this case, it is recommended to also set
// +link{resultTree.progressiveLoading,progressiveLoading} to <code>true</code> to prevent
// users from causing a large number of nodes to be loaded by scrolling too far ahead in the
// tree.
// <p>
// <h4>Required Format for Paging</h4>
// <P>
// <code>DsResponse</code>s from the server for a paging ResultTree should have the format:
// <pre><code>{startRow:  &lt;n&gt; // requested start row (index within direct siblings)
// endRow:    &lt;m&gt; // requested end row (index within direct siblings)
// totalRows: &lt;p&gt; // total rows that match the criteria (all direct siblings)
// data: [
//     // would have m - n entries
//     // if for any folder, "isOpen" property is true, node must have the format:
//     {isOpen: true,
//      children: [
//          // child nodes - the server decides how many to send based on paging logic
//      ],
//      childCount: &lt;q&gt; // for paging; required if more children present than returned
//     }
// ]}
// </code></pre>
// Both <code>startRow</code> and <code>endRow</code> may differ from the values passed to
// +link{resultTree.getRange()} (being farther apart) due to paging, and the value of
// <code>endRow</code> returned by the server may be less than that requested due to 
// <code>totalRows</code> not allowing enough requested rows.  <b>However, you must provide all
// requested rows if they're available - you can't return less than the full range requested
// just because you feel it might improve performance (or other reasons).</b>
// <P>
// If any child node is open,
// the rules are:<ul>
// <li>if a node has children, at least one must be included (we recommend at least a page)
// via the +link{tree.childrenProperty,childrenProperty}, and unless they're all included, the
// +link{resultTree.childCountProperty,childCountProperty} must be specified
// <li>if a node has no children, then either +link{tree.childrenProperty,childrenProperty} must
// be specified as the empty array, or +link{resultTree.childCountProperty,childCountProperty}
// provided as 0</ul>
// The +link{resultTree.childCountProperty,childCountProperty} may be provided even if not
// required as long as it's consistent with the +link{tree.childrenProperty,childrenProperty},
// and both may also be optionally specified for closed nodes.  <b>If the rule about providing
// children for each open node is violated, a warning will be logged and an immediate fetch
// issued for the missing children.</b>  Note that in the above <code>DSResponse</code>, or in
// general when paging is active, you can't supply mixed levels of nodes in the data as is
// described in the section "Multi-Level Load on Demand" above for simpler modes of 
// <code>ResultTree/Tree</code>. 
// <P>
// Your server logic must choose which nodes to return as open or closed, and intelligently
// decide how many children to provide for open nodes, but the server should try to satisfy the
// requested <code>startRow</code> and <code>endRow</code> at the top level, and the 
// architecture should ensure that the chosen page size is large enough to at least cover the
// maximum number of visible rows for the <code>TreeGrid</code>.  One reasonable approach might be
// to satisfy the top level node count, but also provide the children for all nested, open
// nodes, counting down, until the requested node count is also met through nested children.
// (Under such an approach, restrictions on the number of open nodes might be needed to avoid
// breaking the format rules we mentioned above when the included node count gets high.)
// <p>
// <h4>Filtering</h4>
// Paged ResultTrees may also be filtered like other trees (see
// +link{resultTree.setCriteria}).  However, if +link{resultTree.keepParentsOnFilter} is
// enabled then server filtering is required.  To illustrate with an example, consider a case
// where the ResultTree has 10,000 folders at root level and where criteria applied to their
// children would eliminate all but 20, which happen to be at the end of the 10,000.  Purely
// client-side logic would have to perform 10,000 fetch operations to check whether each
// root-level node had children before arriving at the final set of 20.
// <p>
// For examples of this feature, see the following SDK example:
// <ul>
// <li>+explorerExample{pagingForChildren,Paging for Children Example}</li>
// </ul>
// <p>
// <b>NOTE:</b> trees with thousands of visible nodes are very difficult for end users to
// navigate.  A <b>majority of the time</b> the best interface for showing a very large tree
// is to show a TreeGrid that displays just folders, adjacent to a ListGrid that shows items
// within those folders.
// <p>
// For example, the data in your email account can be thought of as an enormous tree of
// folders (Inbox, Sent, Drafts, Trash etc) with thousands of messages in each folder.
// However, none of the common email clients display email this way; all of them choose to
// show folders and messages separately, as this is clearly more usable.
// <p>
// Before starting on implementing paging within sets of children, carefully consider whether
// an interface like the above, or some entirely different interface, is actually a superior
// option.  It is exceedingly rare that paging within sets of children is the best choice.
//
// @title Tree DataBinding
// @treeLocation Client Reference/Data Binding
// @visibility external
//< 







//>	@class ResultTree
// ResultTrees are an implementation of the +link{class:Tree} API, used to handle hierarchical
// data, whose nodes are DataSource records which are retrieved from a server.
// <P>
// <b>Modifying ResultTrees</b>
// <P>
// <code>ResultTree</code> nodes cannot be directly added or removed from a
// +link{resultTree.fetchMode,paged} <code>ResultTree</code> via +link{Tree} APIs such as
// +link{Tree.add()} or +link{Tree.remove()}, since such trees are considered to be read-only
// by virtue of containing +link{ResultSet}s, which are read-only data structures.  Even in
// other +link{fetchMode}s, calling such APIs will only update the local cache of the
// ResultTree, rather than triggering any server traffict to update the DataSource.
// <P>
// Use +link{dataSource.addData()}/+link{DataSource.removeData(),removeData()} to add/remove
// rows from the +link{DataSource}, and the <code>ResultTree</code> will reflect the changes
// automatically.  Alternatively, the +link{DataSource.updateCaches()} method may be called to
// only update local caches of the DataSource in question, without generating any server
// traffic.
// <P>
// To create a locally modifiable cache of records from a DataSource, you can use
// +link{dataSource.fetchData()} to retrieve a List of records which can be modified directly,
// or you can create a client-only +link{DataSource} from the retrieved data to share a
// modifiable cache between several DataBoundComponents.
// 
// @inheritsFrom Tree
// @visibility external
// @treeLocation    Client Reference/Data Binding
//<
isc.ClassFactory.defineClass("ResultTree", isc.Tree);

isc.ResultTree.addClassProperties({
    
    getLoadingMarker : function () {
        return (isc.ResultSet != null ? isc.ResultSet.getLoadingMarker() : Array.LOADING);
    }
});

isc.ResultTree.addProperties({
    nameProperty:"__nodePath",
    nodeTypeProperty:"nodeType",
    childTypeProperty:"childType",

    //> @attr resultTree.modelType (TreeModelType: "parent" : IRWA)
    // @include tree.modelType
    // @visibility external
    //<
    modelType: "parent",

    // DataModel
    // ---------------------------------------------------------------------------------------

    //> @attr resultTree.data (List of TreeNode : null : IRA)
    // Optional initial data for the tree.  If the +link{resultTree.fetchMode,fetchMode} is
    // <code>"basic"</code> or <code>"local"</code> then the format of this data is exactly
    // the same +link{tree.parentIdField,parentId}-linked list of tree nodes as
    // documented on +link{Tree.data} (when the <code>modelType</code> is set to
    // <code>"parent"</code>).  If the <code>fetchMode</code> is <code>"paged"</code> then the
    // format is extended to allow the +link{resultTree.childCountProperty,childCountProperty}
    // to be set on folder nodes.
    // <P>
    // Providing an initial set of nodes in this way does not affect the behavior of the
    // ResultTree in its loading of unloaded folders.  An equivalent result is achieved if the
    // first fetch from the server returns this same data.
    // <P>
    // If <code>fetchMode</code> is <code>"paged"</code> then you may make folder-by-folder
    // choices as to whether to use paging for the childen of each folder.  If you would like
    // to use paging in a folder then you may include a partial list of that folder's children
    // with the data, provided that you set the <code>childCountProperty</code> to the total
    // number of children.  Otherwise you will need to include either all children of the
    // folder or none of the children.  Open folders without any children provided will cause
    // immediate, new fetches for the children, as usual.
    // <P>
    // Because the initial data is treated exactly as though it were returned from the tree's
    // first server fetch, the order of the initial data must match the initial sort order of
    // the TreeGrid displaying the data or, if no such sort is specified, the native storage
    // order on the server.  For example, consider initial data containing <code>n</code>
    // records having the <code>parentId</code> <code>"X"</code>, meaning they are all in
    // the same folder.  These <code>n</code> records are the records at indices
    // <code>0</code> through <code>(n - 1)</code> that are stored on the server under the
    // parent node.  If the <code>childCountProperty</code> set on the parent node indicates
    // that there are <code>m > n</code> total rows under the parent node then the records at
    // indices <code>n</code> to <code>(m - 1)</code> will be fetched from the server as the user
    // scrolls the additional rows into view.
    //
    // @see attr:Tree.data
    // @see TreeNode
    // @group treeDataBinding
    // @visibility external
    //<

    //> @attr resultTree.dataSource (DataSource | ID : null : IR)
    //  What +link{class:DataSource} is this resultTree associated with?
    //
    // @include dataBoundComponent.dataSource
    // @visibility external
    //<

    //> @attr resultTree.context (OperationContext : null : IRA)
    // OperationContext to be sent with all operations performed by this ResultTree.
    //<

    //> @attr resultTree.loadDataOnDemand (Boolean : true : IR)
    // Does this resultTree load data incrementally as folders within the tree are opened, or
    // is it all loaded in a single request?  Must be true if +link{ResultTree.fetchMode} is
    // "paged".
    // @see treeGrid.loadDataOnDemand
    // @see resultTree.useSimpleCriteriaLOD
    // @visibility external
    //<
    loadDataOnDemand:true,
    
    //> @attr resultTree.autoPreserveOpenState (PreserveOpenState : "whenUnique" : IRW)
    // Controls what happens to the +link{getOpenState(),"open state"} - the set of 
    // nodes opened or closed by the end user after tree data is loaded - when an entirely
    // new tree of nodes is loaded from the server, as a consequence of calling 
    // +link{invalidateCache()} or of changing criteria such that the current cache of
    // nodes is dropped.
    // @visibility external
    //<
    autoPreserveOpenState:"whenUnique",
    
    //> @type PreserveOpenState
    // @value never   
    //  Never try to automatically preserve the openState.  Nodes will be initially open 
    //  or closed based solely on the +link{tree.openProperty} optionally set by the server.
    // @value whenUnique
    //  If either the +link{tree.idField} or +link{tree.nameProperty} has been set on 
    //  the Tree, (so that nodes have either unique ids or unique paths), 
    //  preserve openState by respecting the +link{tree.openProperty} set by the server, 
    //  then applying the openState.
    // @value always
    //  Like "whenUnique" but automatically preserves openState even if nodes cannot be
    //  uniquely identified.  This means that nodes at the same tree positions 
    //  (eg 3rd child of 5th node under root) will be placed in the same openState, 
    //  regardless of whether that node has anything to do with the node that previously 
    //  was at that tree position.
    //
    // @visibility external
    //<

    //> @attr resultTree.fetchDelay (Integer : 0 : IRWA)
    // Value to apply to +link{ResultSet.fetchDelay} for any +link{ResultSet} automatically
    // created by this <code>ResultTree</code> in support of +link{fetchMode}: "paged".
    //<
    fetchDelay: 0,
    
    //> @attr resultTree.fetchMode (FetchMode : "basic" : IR)
    // Mode of fetching records from server.
    // <P>
    // fetchMode:"local" implies that local filtering will always be performed. See
    // +link{keepParentsOnFilter} for additional filtering details.
    // <P>
    // fetchMode:"basic" or "paged" implies that if search criteria change, the entire
    // tree will be discarded and re-fetched from the server.  When retrieving the replacement
    // tree data, the default behavior will be to preserve the +link{getOpenState,openState}
    // for any nodes that the server returns which were previously opened by the user.  Note
    // that this implies that if +link{loadDataOnDemand} is enabled and the server returns only
    // root-level nodes, open state will be preserved only for root-level nodes, and children
    // of open root-level nodes will be immediately fetched from the server if
    // they are not included in the server's initial response.
    // <P>
    // fetchMode:"paged" enables paging for nodes that have very large numbers of children.
    // Whenever the children of a folder are loaded, the <code>resultTree</code> will set
    // +link{dsRequest.startRow} and +link{dsRequest.endRow,endRow} when requesting children
    // from the DataSource, and will manage loading of further children on demand, similar to
    // how a +link{ResultSet} manages paging for lists.  For a deeper discussion see the
    // <b>Paging large sets of children</b> section of the +link{group:treeDataBinding}
    // overview.
    //
    // @example pagingForChildren
    // @see resultTree.loadDataOnDemand
    // @see resultTree.useSimpleCriteriaLOD
    // @group treeDataBinding
    // @visibility external
    //<
    fetchMode:"basic",
    

    //> @attr resultTree.resultSize (Integer : 75 : IRA)
    // How many tree nodes to retrieve at once from each large set of children in the tree.
    // <P>
    // Applicable only with <code>fetchMode: "paged"</code>.  When a paged ResultTree is asked
    // for rows that have not yet been loaded, it will fetch adjacent rows that are likely to
    // be required soon, in batches of this size.
    // @group treeDataBinding
    // @visibility external
    //<
    resultSize: 75,

    
    _childrenResultSetProperties: {
        fetchMode: "paged",

        
        _dataAdd : function (records, length, rowNum) {
            var tree = this._tree,
                parentNode = this._parentNode;
            tree._childrenDataAdd(this, parentNode, records, length, rowNum, true);
        },
        _dataAdded : function (records, length, rowNum) {
            var tree = this._tree,
                parentNode = this._parentNode;
            tree._childrenDataAdd(this, parentNode, records, length, rowNum, false);
        },
        _dataRemove : function (records, length, rowNum) {
            var tree = this._tree,
                parentNode = this._parentNode;
            tree._childrenDataRemove(this, parentNode, records, length, rowNum, true);
        },
        _dataRemoved : function (records, length, rowNum) {
            var tree = this._tree,
                parentNode = this._parentNode;
            tree._childrenDataRemove(this, parentNode, records, length, rowNum, false);
        },
        _dataSplice : function (originalRecords, originalLength, rowNum, updatedRecords, updatedLength) {
            var tree = this._tree,
                parentNode = this._parentNode;
            tree._childrenDataSplice(
                this, parentNode, originalRecords, originalLength, rowNum,
                updatedRecords, updatedLength, true);
        },
        _dataSpliced : function (originalRecords, originalLength, rowNum, updatedRecords, updatedLength) {
            var tree = this._tree,
                parentNode = this._parentNode;
            tree._childrenDataSplice(
                this, parentNode, originalRecords, originalLength, rowNum,
                updatedRecords, updatedLength, false);
        },
        _dataMoved : function (records, length, originalRowNum, updatedRowNum) {
            var tree = this._tree,
                parentNode = this._parentNode;
            tree._childrenDataMoved(this, parentNode, records, length, originalRowNum, updatedRowNum);
        },
        _dataLengthIsKnownChanged : function (originalValue, updatedValue) {
            var tree = this._tree,
                parentNode = this._parentNode;
            tree._childrenDataLengthIsKnownChanged(this, parentNode, originalValue, updatedValue);
        },
        
        // ensure that if updateCacheData runs we apply changes to the record
        // in the dataSet rather than replacing it with a new object.
        // This ensures we don't lose metadata required for the tree
        
        applyUpdatesToExistingRecord:true
    },

    //> @attr resultTree.childCountProperty (String : "childCount" : IR)
    // When using +link{fetchMode,fetchMode:"paged"} and providing multiple levels of the tree in
    // one DSResponse, <code>childCountProperty</code> must be set for any folders that include
    // only a partial list of children.
    // For a deeper discussion see the <b>Paging large sets of children</b> section of the
    // +link{group:treeDataBinding} overview.
    // @example multiLevelChildPaging
    // @visibility external
    //<
    childCountProperty: "childCount",

    //> @attr resultTree.canReturnOpenSubfoldersProperty (String : "canReturnOpenSubfolders" : IR)
    // When using +link{fetchMode,fetchMode:"paged"} and providing multiple levels of the tree
    // in one DSResponse, <code>canReturnOpenSubfoldersProperty</code> may be set on any
    // folder to indicate whether child folders might be returned by the server already open.
    // If the property is set to false on a folder then subfolders of that folder are never
    // allowed to be returned already open.  This enables the paging mechanism to be more
    // efficient in the amount of data that it requests from the server.
    // <P>
    // For example, setting the <code>canReturnOpenSubfoldersProperty</code> value to
    // <code>false</code> on a node is appropriate if the server-side code determines that the
    // the node's children consist of entirely leaf nodes.
    // @see resultTree.canReturnOpenFolders
    // @visibility external
    //<
    canReturnOpenSubfoldersProperty: "canReturnOpenSubfolders",

    //> @attr resultTree.canReturnOpenFolders (boolean : false : IR)
    // When using +link{fetchMode,fetchMode:"paged"} and providing multiple levels of the tree
    // in one DSResponse, this property specifies the default value assumed for the
    // +link{canReturnOpenSubfoldersProperty} when no value for that property is provided for
    // a node.
    // @visibility external
    //<
    canReturnOpenFolders: false,

    //> @attr resultTree.progressiveLoading (boolean : null : IRW)
    // Sets +link{DataSource.progressiveLoading,progressive loading mode} for this
    // ResultTree.  The ResultTree will copy this setting onto the +link{DSRequest}s that it
    // issues, overriding the OperationBinding- and DataSource-level settings, in cases where
    // the use of progressive loading does not affect the correctness of the tree's paging
    // algorithm.
    // <p>
    // This setting is applied automatically by +link{DataBoundComponent}s that have their own
    // explicit setting for +link{DataBoundComponent.progressiveLoading,progressiveLoading}.
    // <p>
    // <b>Note:</b>  This property only has an effect for +link{fetchMode,fetchMode:"paged"}
    // ResultTrees.
    // @see dataSource.progressiveLoading
    // @see operationBinding.progressiveLoading
    // @see dsRequest.progressiveLoading
    // @see dataBoundComponent.progressiveLoading
    // @group progressiveLoading
    // @visibility external
    //<

    //> @attr resultTree.defaultIsFolder (boolean : null : IR)
    // Controls whether nodes are assumed to be folders or leaves by default.
    // <P>
    // Nodes that have children or have the +link{tree.isFolderProperty,isFolderProperty} set
    // to true will always be considered folders.  Other nodes will be considered folders or
    // leaves by default according to this setting.
    // <P>
    // If <code>defaultIsFolder</code> is unset, the ResultTree will automatically set it to
    // match the value of +link{loadDataOnDemand}.  This means that, when using
    // folder-by-folder load on demand (<code>loadDataOnDemand:true</code>), by default a newly
    // loaded node will be considered to be a folder that has not loaded its children yet.  
    // <P>
    // When not using folder-by-folder load on demand, by default a newly loaded node is
    // considered a leaf.  If you set <code>defaultIsFolder:true</code> explicitly, by default
    // a newly loaded node is considered to be a folder with no children.
    // <P> 
    // See +link{Tree.isFolder()} for details on how to explicitly mark nodes as folders or leaves.
    //
    // @see treeGrid.loadDataOnDemand
    // @visibility external
    //<
    
    //> @attr resultTree.rootNode (Any : null :IR)
    // This attribute may be used to specify a root value for the parentIdField of this resultTree.
    // This overrides the default +link{DataSourceField.rootValue} for this tree, allowing
    // a component to navigate a tree starting at a specific node.
    // <P>
    // May be overridden via +link{TreeGrid.treeRootValue} for ResultTrees generated by a TreeGrid
    // component.
    // @visibility external
    //<

    //> @attr resultTree.autoOpen (String : "none" : IRW)
    // Which nodes should be opened automatically - applied whenever 
    // +link{tree.setRoot, setRoot()} is called, including during initialization and as part of 
    // a re-fetch caused, for example, by +link{tree.duplicate, duplicate()} or 
    // +link{resultTree.invalidateCache, invalidateCache()}.
    // <P>
    // Options are:
    // <ul>
    // <li>"none" - no nodes are opened automatically</li>
    // <li>"root" - opens the +link{resultTree.rootNode, top-level node} - in databound 
    //              trees, this node is always hidden</li>
    // <li>"all" - when +link{resultTree.loadDataOnDemand, loading data on demand}, opens the
    //             +link{resultTree.rootNode, top-level node} and all of it's direct
    //             descendants - otherwise, opens all loaded nodes </li>
    // </ul>
    // @visibility external
    //<
    autoOpen: "none",

    //> @attr resultTree.discardParentlessNodes (boolean : null : IRA)
    // When data is loaded from the server, should nodes with an explicit value for
    // the +link{tree.parentIdField} which doesn't map to a valid parent node be dropped?
    // If set to false, for +link{TreeGrid.loadDataOnDemand}:false trees, parentless nodes will be
    // added as children of the root node - for +link{TreeGrid.loadDataOnDemand}:true, they will be
    // added as children of the folder currently requesting children.
    // <P>
    // This effectively allows nodes to be loaded into the current (or root) folder without
    // needing an explicit +link{tree.parentIdField,parentIdField value} that matches the folder's
    // ID or <code>rootValue</code> for the resultTree.
    // <P>
    // Note: For <code>loadDataOnDemand:false</code> trees, if this property is unset at init time,
    // it will default to <code>true</code> if an explicit +link{resultTree.rootNode} has been
    // specified. This ensures that if the data tree retrieved from the server includes ancestors
    // of the desired root-node we don't display them. Otherwise this property always defaults to
    // false.
    // @visibility external
    //<
    
    //>@attr ResultTree.defaultNewNodesToRoot (Boolean : false : IRWA)
    // This attribute governs how to handle cache-synch when a new node is added to this dataSource 
    // with no explicit parentId.
    // <P>
    // If set to <code>true</code>, when a new node is added to this dataSource via
    // +link{DataSource.addData()}, with no explicit parentId, the node will be added as a 
    // child of the root node of this result tree. Otherwise it will be ignored.
    // <P>
    // Similar logic applies to +link{DataSource.updateData(),updated nodes} - if this property is
    // true and the parentId of an updated node is cleared, it will be moved to become a child of
    // root, otherwise it will be dropped from the tree.
    // @visibility external
    //<
    defaultNewNodesToRoot:false,

    
    //> @attr resultTree.updateCacheFromRequest (Boolean : true : IRA) 
    // When a successful Add, Update or Remove type operation fires on this ResultTree's 
    // dataSource, if +link{dsResponse.data} is unset, should we integrate the submitted
    // data values (from the request) into our data-set?
    //
    // @group cacheSync
    // @visibility external
    //<
    updateCacheFromRequest:true,
        
    //> @attr resultTree.implicitCriteria (Criteria : null : IRW)
    // Criteria that are never shown to or edited by the user and are cumulative with any 
    // criteria provided via +link{dataBoundComponent.initialCriteria}, +link{resultTree.setCriteria}
    // etc.
    // @visibility external
    //<

    //> @method resultTree.getImplicitCriteria()
    // Returns any implicitCriteria applied to +link{resultTree.implicitCriteria, this ResultTree} 
    // or its +link{dataBoundComponent.implicitCriteria, parent component}.
    // @return (Criteria | AdvancedCriteria) combined implicitCriteria
    // @visibility internal
    //<
    getImplicitCriteria : function () {
        if (!this.implicitCriteria && !this.dbcImplicitCriteria) return null;
        return isc.DS.compressNestedCriteria(this.getDataSource().combineCriteria(
            isc.DataSource.copyCriteria(this.dbcImplicitCriteria), 
            isc.DataSource.copyCriteria(this.implicitCriteria)
        ));
    },

    setDbcImplicitCriteria : function (dbcImplicitCriteria, callback) {

        this.lastImplicitCriteria = !this.dbcImplicitCriteria ? null :
                isc.DS.copyCriteria(this.dbcImplicitCriteria);
        // store the dbcImplicitCriteria
        this.dbcImplicitCriteria = dbcImplicitCriteria;

        // update the context
        if (this.context) {
            this.context.lastImplicitCriteria = isc.DS.copyCriteria(this.lastImplicitCriteria);
            this.context.dbcImplicitCriteria = isc.DS.copyCriteria(this.dbcImplicitCriteria);
            if (callback) this.context.afterFlowCallback = callback;
        }

        // call setCriteria(current criteria) to re-evaluate the combined implicit/explicit crit
        return this.setCriteria(this.criteria, true);
    },

    //> @attr resultTree.disableCacheSync (Boolean : false : IRA)
    // By default when the data of this ResultTree's dataSource is modified, the ResultTree will
    // be updated to display these changes.
    // Set this flag to true to disable this behavior.
    // @group cacheSync
    // @visibility external
    //<

    // Multilink
    // ----------------------------------------------------------------------------------------

    //> @attr resultTree.linkDataSource (DataSource | ID : null : IR)
    // This property allows you to specify the dataSource to be used for fetching link information
    // in a databound <i>multilink</i> tree.  A multilink tree is one where the same node is 
    // allowed to appear in multiple places in the tree, and it is achieved by providing the node 
    // data and the link data separately.  Nodes are provided via the normal 
    // +link{resultTree.dataSource,dataSource}; <code>linkDataSource</code> is only used for 
    // fetching and updating link information.  
    // <p>
    // The <code>linkDataSource</code> is an ordinary +link{class:DataSource} that you implement
    // just like any other.  However, for correct operation as a <code>linkDataSource</code>, it 
    // must have the following:<ul>
    // <li>A +link{dataSourceField.primaryKey,primaryKey field}.  Like any dataSource, a 
    // <code>linkDataSource</code> is not fully functional without a <code>primaryKey</code> field</li>
    // <li>A field named the same as the +link{tree.parentIdField}</li>
    // <li>A field named the same as the +link{tree.idField}</li>
    // <li>Optionally, a field named the same as the +link{tree.linkPositionField}</li>
    // <li>Fields for other values you may wish to store with the link, if any</li>
    // </ul>
    // <h3>Providing node data and link data</h3>
    // Consider a structure for the components of a bicycle, greatly simplified:<pre>
    //         Frame
    //        /    \
    //     Wheel   Wheel
    //    /  \     /  \
    //  Hub Tire  Hub Tire
    // </pre>
    // Here, the two wheels are the same assembly, so really it should look like this:<pre>
    //       Frame
    //        | |               
    //       Wheel
    //       /   \     
    //     Hub  Tire 
    // </pre>
    // Normal SmartClient trees cannot model this arrangement accurately because this is not 
    // really a tree, it is a graph; trees do not contain multiple paths to a given node.  The 
    // only way to handle this arrangement of nodes in a formal tree would be to make two copies
    // of the "Wheel" node, at which point they are no longer the same thing. Either way, in a 
    // +link{class:TreeGrid}, we would have to visualise it like this:<pre> 
    //   Frame
    //      Wheel
    //         Hub
    //         Tire
    //      Wheel
    //         Hub
    //         Tire
    // </pre>
    // But if we use copies so that the the two wheels are no longer the same thing, changing 
    // one of them will no longer change the other, which is a fundamental problem because in 
    // this scenario, the two wheels really are the same thing.  Now, changing the name of the 
    // "Hub" in one "Wheel" would not change it in the other; adding a "Spokes" node to the 
    // second item would not also add it to the first.  Drag-reordering child nodes in one 
    // "Wheel" would not re-order them in the other.  All of these things are incorrect, because
    // the two wheels are the same thing.
    // <p>
    // Multilink trees provide a way to handle this arrangement without physical copying of the
    // duplicate nodes, preserving the sameness of them and thus fixing all the problems
    // described above.
    // <p>
    // The node data for the above tree, simplified, would be a flat list something like this:<pre>
    //   [
    //      { id: 1, description: "Frame" },
    //      { id: 2, description: "Wheel" },
    //      { id: 3, description: "Hub" },
    //      { id: 4, description: "Tire" }
    //   ]
    // </pre>
    // The link data would look like this:<pre>
    //   [
    //      { linkId: 1, parentId: 1, id: 2, position: 1 },
    //      { linkId: 2, parentId: 2, id: 3, position: 1 },
    //      { linkId: 3, parentId: 2, id: 4, position: 2 },
    //      { linkId: 4, parentId: 1, id: 2, position: 2 }
    //   ]
    // </pre>
    // Or, if you were using +link{ResultTree.linkDataFetchMode} "single", you would combine 
    // the node and link data into a single dataset like this:<pre>
    //   [
    //      { id: 1, position: 0, description: "Frame" },
    //      { parentId: 1, id: 2, position: 1, description: "Wheel", linkId: 1 },
    //      { parentId: 2, id: 3, position: 1, description: "Hub", linkId: 2 },
    //      { parentId: 2, id: 4, position: 2, description: "Tire", linkId: 3 },
    //      { parentId: 1, id: 2, position: 2, description: "Wheel", linkId: 4 }
    //   ]</pre>
    //
    // <p>
    // <b>NOTE:</b> It is also possible to create an unbound multilink tree - see +link{tree.linkData}.
    // @visibility external
    //<
    
    
    
    //> @type LinkDataFetchMode
    //
    // @value "separate" In this mode, link data is fetched from the 
    // +link{resultTree.linkDataSource} and nodes are separately fetched from the 
    // +link{resultTree.dataSource}.  The two fetches are sent together in a 
    // +link{RPCManager.startQueue,queue}, with the link data fetch first and the separate 
    // node fetch second.  This makes it possible for your server-side code to use the results
    // of the link data fetch to constrain the node fetch (ie, only fetch node information 
    // for nodes that appear in a link)
    //
    // @value "single" In this mode, nodes and link data are fetched together from the main 
    // +link{resultTree.dataSource}, and any duplicated node IDs are handled by creating multiple
    // links to a single node.  In this mode, the +link{resultTree.linkDataSource} is only used
    // for update operations.
    // <p>
    // Note that the end result of a "single" fetch is exactly the same as fetching link data 
    // and nodes separately using "separate" mode; "separate" mode is also conceptually clearer
    // since it emphasises the fact that nodes and link data are separate things.  We provide
    // "single" mode because, in some cases, it may be more efficient to fetch the two types of
    // data together in a single database fetch, using +link{dataSourceField.includeFrom} or 
    // some other kind of join technique on the server.
    //
    // @visibility external
    //<

    //>	@attr resultTree.linkDataFetchMode (LinkDataFetchMode : "separate" : IR)
    // The fetch mode for this tree's link data; ignored if this is not a 
    // +link{tree.isMultiLinkTree(),multi-link tree}
    // @group multiLinkTree
    // @visibility external
    //<
    linkDataFetchMode: "separate",

    //>	@attr resultTree.sendNullParentInLinkDataCriteria (Boolean : true : IR)
    // For +link{tree.isMultiLinkTree(),multi-link tree}s only, should we send up the 
    // +link{tree.parentIdField,parentId} in fetch criteria if the criteria value is null?  If 
    // false, we remove the <code>parentId</code> from the criteria when 
    // +link{resultTree.linkDataSource,fetching link data}, <b>if</b> the criteria value is 
    // null (as it will be by default when fetching the direct child nodes of the tree's root).
    // <p>
    // Ignored for non-multiLink trees.
    // @group multiLinkTree
    // @visibility external
    //<
    sendNullParentInLinkDataCriteria: true,

    //>	@attr resultTree.linkDataFetchOperation (String : null : IRW)
    // The +link{DSRequest.operationId,operationId} this <code>ResultTree</code> should use 
    // when performing fetch operations on its +link{ResultTree.linkDataSource}.  Has no effect
    // if this is not a +link{tree.isMultiLinkTree(),multi-link tree}
    // <p>
    // Note, this value can be overridden by +link{DSRequest.linkDataFetchOperation} when 
    // calling <code>fetchData()</code> on the component (e.g. +link{TreeGrid.fetchData(),
    // TreeGrid.fetchData}) directly from application code.
    // @group multiLinkTree
    // @visibility external
    //<

    //>	@attr resultTree.linkDataAddOperation (String : null : IRW)
    // The +link{DSRequest.operationId,operationId} this <code>ResultTree</code> should use 
    // when performing add operations on its +link{ResultTree.linkDataSource}.  Has no effect
    // if this is not a +link{tree.isMultiLinkTree(),multi-link tree}.
    // <p>
    // Note, this property wll be used by internal update operations when you drag-move or 
    // drag-reparent nodes in a multi-link tree.  Do not use it when adding records from 
    // application code by directly calling <code>addData()</code> on the 
    // +link{ResultTree.linkDataSource,linkDataSource}; instead just use the regular 
    // <code>operationId</code> property in your add request.  Also note, because this 
    // property is intended to allow your code to influence the operationId used by internal 
    // methods, and those methods never directly update link data (moved and re-parented links 
    // are always removed and then re-added), there is no corresponding 
    // <code>linkDataUpdateOperation</code> property.
    // @group multiLinkTree
    // @visibility external
    //<

    //>	@attr resultTree.linkDataRemoveOperation (String : null : IRW)
    // The +link{DSRequest.operationId,operationId} this <code>ResultTree</code> should use 
    // when performing remove operations on its +link{ResultTree.linkDataSource}.  Has no effect
    // if this is not a +link{tree.isMultiLinkTree(),multi-link tree}.
    // <p>
    // See +link{ResultTree.linkDataAddOperation} for more information on how this property is 
    // intended to be used.
    // @group multiLinkTree
    // @visibility external
    //<

    //>	@attr resultTree.autoUpdateSiblingNodesOnDrag (Boolean : (see below) : IR)
    // For +link{tree.isMultiLinkTree(),multi-link trees}, indicates that we should automatically
    // update the +link{tree.linkPositionField,position} values of old and new sibling records 
    // after a drag reparent or reposition-within-parent operation.  For example, say you have a 
    // tree like this (where the number in parentheses indicates the node's 
    // +link{tree.linkPositionField,position} value):<pre>
    //      A
    //        - B (1)
    //        - C (2)
    //        - D (3)
    //      E
    //        - F (1)
    //        - G (2)</pre>
    // and you drag node C out and drop it between nodes F and G.  This drag operation will spawn
    // two update operations to the server: a "remove" to delete node C from parent A, and an "add"
    // to re-add it under parent E.  With <code>autoUpdateSiblingNodesOnDrag</code> in force, we 
    // also automatically issue two "update" operations to the server - one to change the position 
    // on node D to 2, and another to change the position on node G to 3.  The end result of this
    // is that node position values are kept correct.
    // <p>
    // Please note the following:<ul>
    // <li>As noted above, these automatic updates are persistent - we send a queue of actual 
    // update requests to the server.  This is convenient, but it may not be terribly efficient, 
    // particularly if you have just dropped a node at the head of a list of several hundred 
    // siblings.  This is why we do not default this setting to true</li>
    // <li>The automatic updates work by applying an integer delta value to the existing position
    // value.  So in the above example, we would compute a delta of negative 1 for node D and 
    // positive 1 for node G.  The upshot of this is that <code>autoUpdateSiblingNodesOnDrag</code>
    // only works well if your position values are consecutive integers</li></ul>
    // @group multiLinkTree
    // @visibility external
    //<
    

    //>	@attr resultTree.firstPositionValue (Integer : 1 : IRW)
    // If +link{resultTree.autoUpdateSiblingNodesOnDrag} is in force, this is the value we will 
    // use to auto-update the position of a node when we cannot derive that value from the 
    // existing value of a neighbor.  This happens when a node is dropped into the very first 
    // position below a parent (including the special case of the parent being previously empty)
    // @group multiLinkTree
    // @visibility external
    //<
    firstPositionValue: 1


    // Filtering
    // ----------------------------------------------------------------------------------------

    //> @attr resultTree.keepParentsOnFilter (boolean : null : IR)
    // If set, tree-based filtering is performed such that parent nodes are kept as long as
    // they have children that match the filter criteria, even if the parents themselves do not
    // match the filter criteria. If not set, filtering will exclude parent nodes not matching
    // the criteria and all nodes below them in the tree.
    // <P>
    // ResultTrees will default to +link{fetchMode,fetchMode:"local"} whenever 
    // <code>keepParentsOnFilter</code> is true, unless fetchMode was explicitly set to
    // <code>"paged"</code> (see below). This allows the filtering logic to
    // fetch a complete tree of nodes from the DataSource (or if 
    // +link{loadDataOnDemand}:true, a complete set of nodes under a given parent) and then
    // filter the resulting data locally on the client. 
    // <P>
    // This means that the server does not need to implement special tree filtering logic
    // to support looking up nodes that match the specified criteria as well as ancestor nodes
    // that may not.
    // <P>
    // If some criteria <i>must</i> be sent to the server in order to produce a valid tree of
    // data, but <code>keepParentsInFilter</code> is also required, the 
    // +link{resultTree.serverFilterFields} attribute may be used to specify a list
    // of field names that will be sent to the server whenever they are present in the 
    // criteria. Note that for the subset of criteria applied to these fields,
    // <code>keepParentsInFilter</code> behavior will not occur without custom 
    // logic in the DataSource fetch operation.
    // <P>
    // If +link{fetchMode} is explicitly set to <code>"paged"</code>, it is not possible 
    // to implement <code>keepParentsOnFilter</code> by local filtering. Support for
    // <code>keepParentsOnFilter</code> for a paged ResultTree therefore also requires
    // custom logic in the DataSource fetch operation. To support this a developer
    // must ensure that their fetch operation returns the appropriate set of nodes -
    // all nodes that match the specified criteria plus their ancestor nodes even
    // if they do not match the specified criteria.
    //
    // @group treeDataBinding
    // @visibility external
    //<
    

    //> @attr resultTree.serverFilterFields (Array of String : null : IR)
    // For +link{fetchMode,fetchMode:"local"} ResultTrees, this property lists field names 
    // that will be sent to the server if they are present in the criteria.
    // <P>
    // This property may be used to ensure a dataSource receives the necessary criteria
    // to populate a ResultTree's data, and also support +link{keepParentsOnFilter}. 
    // <P>
    // Note that for some AdvancedCriteria it will not be possible to extract the
    // subcriteria that apply to certain fields. See +link{Datasource.splitCriteria()}
    // for details on how serverFilterFields-applicable subcriteria are extracted from
    // the specified criteria for the tree.
    //
    // @visibility external
    //<
});

isc.ResultTree.addMethods({


add : function (node, parent, position) {
    if (this.isPaged()) {
        isc.logWarn(
            "ResultTrees with fetchMode \"paged\" are read-only.  This operation (add) will " +
            "be ignored.");
    } else {
        return this.invokeSuper(isc.ResultTree, "add", node, parent, position);
    }
},
addList : function (nodeList, parent, position) {
    if (this.isPaged()) {
        isc.logWarn(
            "ResultTrees with fetchMode \"paged\" are read-only.  This operation (addList) " +
            "will be ignored.");
    } else {
        return this.invokeSuper(isc.ResultTree, "addList", nodeList, parent, position);
    }
},
linkNodes : function (records, idProperty, parentIdProperty, rootValue, isFolderProperty, 
                      contextNode, suppressDataChanged) 
{
    if (this.isPaged()) {
        isc.logWarn(
            "ResultTrees with fetchMode \"paged\" are read-only.  This operation " +
            "(linkNodes) will be ignored.");
    } else {
        return this.invokeSuper(
            isc.ResultTree, "linkNodes",
            records, idProperty, parentIdProperty, rootValue, isFolderProperty, contextNode,
            suppressDataChanged);
    }
},
move : function (node, newParent, position) {
    if (this.isPaged()) {
        isc.logWarn(
            "ResultTrees with fetchMode \"paged\" are read-only.  This operation (move) " +
            "will be ignored.");
    } else {
        return this.invokeSuper(isc.ResultTree, "move", node, newParent, position);
    }
},
remove : function (node, noDataChanged) {
    if (this.isPaged()) {
        isc.logWarn(
            "ResultTrees with fetchMode \"paged\" are read-only.  This operation (remove) " +
            "will be ignored.");
    } else {
        return this.invokeSuper(isc.ResultTree, "remove", node, noDataChanged);
    }
},
removeList : function (nodeList) {
    if (this.isPaged()) {
        isc.logWarn(
            "ResultTrees with fetchMode \"paged\" are read-only.  This operation " +
            "(removeList) will be ignored.");
    } else {
        return this.invokeSuper(isc.ResultTree, "removeList", nodeList);
    }
},


//>	@method	resultTree.init()	(A)
//			Initialize this ResultTree.  Pass in objects with properties to add or override
//			defaults.
//
//		@param	[all arguments]	(Object)	objects with properties to override from default
//<
init : function (a,b,c,d,e,f) {
	// create a pointer to us in the global context
	isc.ClassFactory.addGlobalID(this);

	if (!this.criteria) this.criteria = {};

    if (!this.operation) this.operation = {operationType : "fetch"};

    // dataSource can be specified either on the operation or the ResultTree.
    if (!this.dataSource) this.dataSource = this.operation.dataSource;
    if (!this.operation.dataSource) this.operation.dataSource = this.dataSource;
    
    
    if (isc.isAn.Array(this.dataSource)) {
        this.dataSource = this.dataSource[0];
        this.operation.dataSource = this.dataSource;
    }
    
    // If any of rootValue, idField, parentIdField are not explicitly specified on this
    // ResultTree, autodetect them from the DataSource relationship.
    if (!this.isMultiDSTree()) {
        
        // root node has to exist for getTreeRelationship to work, so create it now if it
        // doesn't exist 
        if (!this.root) this.root = this.makeRoot();
        var relationship = this.getTreeRelationship(this.root);

        var undef;
        // compare to undef because rootValue can be set to null
        if (this.rootValue === undef) this.rootValue = relationship.rootValue;
        
        // If we're not loading on demand, and the rootValue is not null/undef,
        // 'discardParentlessNodes' to true.
        // This ensures that if we load an entire tree, and have a rootValue set to pick up 
        // a sub-tree of that, we don't add the full tree's top level element to root and thus
        // show the entire tree
        if (!this.loadDataOnDemand && 
            (this.rootValue != null || (this.root != null && this.root[this.idField] != null)) &&
            this.discardParentlessNodes == null)
        {
            this.discardParentlessNodes = true;
        }
        
        if (this.idField == null) this.idField = relationship.idField;
        if (this.parentIdField == null) this.parentIdField = relationship.parentIdField;
        if (relationship.childrenProperty) this.childrenProperty = relationship.childrenProperty;
        
        this.root[this.idField] = this.rootValue;
    }

    // establish default values for isFolderProperty et al that were not derived from the tree
    // relationship
    this.setupProperties();

    // For paged ResultTrees, use the same resultSize for every ResultSet of children.
    if (this.isPaged()) {
        // context.dataPageSize may be set if specified on a DataBoundComponent that created us.
        var context = this.context;
        this.resultSize = context && context.dataPageSize > 0 ? 
                                     context.dataPageSize : this.resultSize;

        this._childrenResultSetProperties = isc.addProperties({}, this._childrenResultSetProperties, {
            resultSize: this.resultSize
        });
    }

    // keepParentsOnFilter usually implies fetchMode:"local".
    if (this.keepParentsOnFilter && !(this.isPaged() || this.isLocal())) {
        this.fetchMode = "local";
    }
    // If we have specified serverFilterFields, split our criteria up so we can filter correctly
    if (this.isLocal() &&
        this.serverFilterFields != null &&
        this.serverFilterFields.length > 0)
    {
        var specifiedCriteria = this.getCombinedCriteria();
        this._localCriteria = isc.DataSource.copyCriteria(specifiedCriteria);
        this._serverCriteria = this.getDataSource().splitCriteria(this._localCriteria, this.serverFilterFields, true);
    }

    // force loadDataOnDemand: true if paging is enabled
    if (!this.loadDataOnDemand && this.isPaged()) {
        this.logWarn("Found loadDataOnDemand: false, but that's incompatible with fetchMode: " +
                     "'paged' - setting true");
        this.loadDataOnDemand = true;
    }

    if (this.initialData) {
        if ("parent" == this.modelType) this.data = this.initialData;
        else if ("children" == this.modelType) this.root = this.initialData;
    }

    // observe dataChanged on our dataSource
    var dataSource = isc.DataSource.getDataSource(this.dataSource);
    this.observe(dataSource, "dataChanged", "observer.dataSourceDataChanged(dsRequest,dsResponse);");

    if (this.isMultiLinkTree()) {
        // observe dataChanged on our linkDataSource
        var linkDataSource = isc.DataSource.getDataSource(this.linkDataSource);
        if (linkDataSource) {
            this.observe(linkDataSource, "dataChanged", "observer.linkDataSourceDataChanged(dsRequest,dsResponse);");
        }
    }

    // whether to invalidate our cache when an update occurs on one of our datasources.
    // Default is update the current cache in place.
    this.dropCacheOnUpdate = this.operation.dropCacheOnUpdate;
    
    // set up defaultIsFolder before invoking Tree.init
    // This is required in _linkNodes() to ensure LOD ResultTrees' child nodes show up as
    // openable folders.
    if (this.defaultIsFolder == null) this.defaultIsFolder = this.loadDataOnDemand;

    this.invokeSuper(isc.ResultTree, "init", a,b,c,d,e,f);

    // if we're not using folder-by-folder load on demand, all nodes should be initially marked loaded
    this.setDefaultLoadState(this.loadDataOnDemand ? isc.Tree.UNLOADED : isc.Tree.LOADED);
},


setupProperties : function () {
    this.invokeSuper(isc.ResultTree, "setupProperties");

    if (this.isPaged()) {
        // An auto-generated property name to store precomputed booleans for whether a node and
        // all of its visible descendants are all loaded.
        this._visibleDescendantsCachedProperty = ("_visibleDescendantsCached_" + this.ID);

        
        this._initialLoadingStateProperty = ("_initialLoadingState_" + this.ID);
        this._initialLoadingFetchCountProperty = ("_initialLoadingFetchCount_" + this.ID);
    }
},

// extend the list of copied properties defined in isc.Tree
_knownProperties : isc.Tree.getPrototype()._knownProperties.concat([
    "fetchMode", "dataSource", "loadDataOnDemand", "childCountProperty", "defaultIsFolder",
    "discardParentlessNodes", "defaultNewNodesToRoot", "updateCacheFromRequest",  
    "disableCacheSync", "keepParentsOnFilter", "serverFilterFields", "canReturnOpenFolders",
    "linkDataSource" ]),


duplicate : function (includeData, includeLoadState, ignoreDataChanged) {

    var serverFilterFields = this.serverFilterFields;
    if (isc.isAn.Array(serverFilterFields)) {
        serverFilterFields = serverFilterFields.duplicate();
    }

    
    var newResultTreeConfig = {};
    this._copyKnownProperties(newResultTreeConfig);

    
    newResultTreeConfig.autoOpenRoot = false;

    
    var newResultTree = this.getClass().newInstance(newResultTreeConfig);

    // just clear observer here rather than adding property above to skip in init()
    if (ignoreDataChanged) {
        var dataSource = isc.DataSource.getDataSource(this.dataSource);
        if (dataSource) newResultTree.ignore(dataSource, "dataChanged");
        if (this.isMultiLinkTree()) {
            var linkDataSource = isc.DataSource.getDataSource(this.linkDataSource);
            if (linkDataSource) newResultTree.ignore(linkDataSource, "dataChanged");
        }
    }

    // Multi-link trees do not allow partially-loaded nodes, so we only need to do what the  
    // unbound Tree's duplicate() function does
    if (this.isMultiLinkTree()) {
        return this.Super("duplicate", [includeData, includeLoadState, newResultTree], arguments);
    }

    var root               = this.getRoot(),
        rootIsOpen         = this.isOpen(root, this.pathDelim),
        rootIsFolder       = this.isFolder(root),
        rootCachedLength   = root[this._cachedLengthProperty],
        rootRecursionCount = root[this._recursionCountProperty],
        rootAllCached      = root[this._visibleDescendantsCachedProperty],
        newRoot = this.getCleanNodeData(root, false, false, includeLoadState);

    
    newRoot[newResultTree.openProperty]                      = rootIsOpen;
    newRoot[newResultTree.isFolderProperty]                  = rootIsFolder;
    newRoot[newResultTree._cachedLengthProperty]             = rootCachedLength;
    newRoot[newResultTree._recursionCountProperty]           = rootRecursionCount;
    newRoot[newResultTree._visibleDescendantsCachedProperty] = rootAllCached;

    this._duplicate(root, newResultTree, newRoot, includeLoadState);
    newResultTree.setRoot(newRoot);
    return newResultTree;
},


_getCleanNodeData : function (newTree, nodeList, includeLoadState) {
    var cachedLengthProperty = this._cachedLengthProperty,
        recursionCountProperty = this._recursionCountProperty,
        allCachedProperty = this._visibleDescendantsCachedProperty,

        newOpenProperty = newTree.openProperty,
        newIsFolderProperty = newTree.isFolderProperty,
        newCachedLengthProperty = newTree._cachedLengthProperty,
        newRecursionCountProperty = newTree._recursionCountProperty,
        newAllCachedProperty = newTree._visibleDescendantsCachedProperty;

    if (nodeList == null) {
        return null;
    } else if (isc.isAn.Array(nodeList)) {
        var newNodeList = new Array(nodeList.length);
        for (var i = nodeList.length; i--; ) {
            var oldNode = nodeList[i],
                newNode = null;
            if (oldNode != null) {
                
                if (!this.isMultiLinkTree()) {
                    var isOpen = this.isOpen(oldNode),
                        isFolder = this.isFolder(oldNode),
                        cachedLength = oldNode[cachedLengthProperty],
                        recursionCount = oldNode[recursionCountProperty],
                        allCached = oldNode[allCachedProperty];
                }

                newNode = this.getCleanNodeData(oldNode, false, false, includeLoadState);

                if (!this.isMultiLinkTree()) {
                    newNode[newOpenProperty] = isOpen;
                    newNode[newIsFolderProperty] = isFolder;
                    newNode[newCachedLengthProperty] = cachedLength;
                    newNode[newRecursionCountProperty] = recursionCount;
                    newNode[newAllCachedProperty] = allCached;
                }
            }
            newNodeList[i] = newNode;
        }
        return newNodeList;
    } else {
        if (!this.isMultiLinkTree()) {
            var isOpen = this.isOpen(nodeList),
                isFolder = this.isFolder(nodeList),
                cachedLength = nodeList[cachedLengthProperty],
                recursionCount = nodeList[recursionCountProperty],
                allCached = nodeList[allCachedProperty];
        }
        var newNode = this.getCleanNodeData(nodeList, false, false, includeLoadState);

        if (!this.isMultiLinkTree()) {
            newNode[newOpenProperty] = isOpen;
            newNode[newIsFolderProperty] = isFolder;
            newNode[newCachedLengthProperty] = cachedLength;
            newNode[newRecursionCountProperty] = recursionCount;
            newNode[newAllCachedProperty] = allCached;
        }

        return newNode;
    }
},

_duplicate : function (node, newTree, newNode, includeLoadState) {
    

    // If the node is a leaf, return immediately since it's not going to have any children.
    if (this.isLeaf(node)) {
        return;
    }

    var children = this.getChildren(node),
        childrenLength = 0;

    if (isc.isA.ResultSet(children)) {
        childrenLength = children.getLength();
        newNode[newTree.childCountProperty] = childrenLength;
        var newChildren = newNode[newTree.childrenProperty] = new Array(childrenLength);
        for (var i = childrenLength; i--; ) {
            newChildren[i] = children.getCachedRow(i);
        }
    } else if (isc.isAn.Array(children)) {
        childrenLength = children.length;
        newNode[newTree.childrenProperty] = children;
    } else if (children) {
        childrenLength = 1;
        newNode[newTree.childrenProperty] = [children];
    }

    // Iterate through all the children of the node to put clean copies of the children under
    // the node of the new tree.
    var modelTypeParent = (this.modelType == isc.Tree.PARENT),
        parentIdField = this.parentIdField,
        newChildren = newNode[newTree.childrenProperty] = this._getCleanNodeData(
            newTree, newNode[newTree.childrenProperty], includeLoadState);
    for (var i = 0; i < childrenLength; ++i) {
        var child = children.getCachedRow(i);
        if (child == null) {
            continue;
        }
        if (modelTypeParent) {
            newChildren[i][parentIdField] = child[parentIdField];
        }

        // If the child is a folder, recurse, but check that it actually has children.
        var grandChildren = child[this.childrenProperty];
        if (grandChildren && !grandChildren.isEmpty()) {
            // Now duplicate the descendants of the child.
            this._duplicate(child, newTree, newChildren[i], includeLoadState);
        }
    }
},


destroy : function () {
    if (this.isPaged()) {
        this._cleanResultSetChildren(this.getRoot(), false);
    }

    var dataSource = isc.DataSource.getDataSource(this.dataSource);
    if (dataSource) this.ignore(dataSource, "dataChanged");
    if (this.isMultiLinkTree()) {
        var linkDataSource = isc.DataSource.getDataSource(this.linkDataSource);
        if (linkDataSource) this.ignore(linkDataSource, "dataChanged");
    }
    this.Super("destroy", arguments);
},

isLocal : function () { return this.fetchMode == "local" },
isPaged : function () { return this.fetchMode == "paged" },
haveCriteria : function (criteria) {
    return !(
        criteria == null ||
        isc.isAn.emptyObject(criteria) ||
        // `isc.DataSource.convertCriteria({})` is considered empty as well:
        (criteria._constructor === "AdvancedCriteria" &&
            criteria.operator === "and" &&
            isc.isAn.Array(criteria.criteria) &&
            criteria.criteria.length == 0));
},

// This is necessary to support higher-level callback processing like for DBC.filterData.
setContext : function (context) {
    this.context = context;

    // Update the context on any ResultSet children.
    if (this.isPaged() && this._resultSetChildren != null) {
        for (var i = this._resultSetChildren.length; i--; ) {
            var newContext = context && isc.addProperties({}, context);
            if (context) {
                delete newContext.clientContext;
                delete newContext.internalClientContext;
            }
            this._resultSetChildren[i].setContext(newContext);
        }
    }
},

// A Tree navigates a 1 to many (parent to children) relationship, which can exist within or 
// across DataSources.

// figuring out the type of child records at each level of the tree
// - use cases
//   - all one type
//     - supported: set just this.dataSource
//   - fixed levels
//     - example: salesOrder, lineItem
//     - supported: set this.dataSource for root DataSource, this.treeRelations for transitions
//   - mixed child types (each parent in a level has different child types)
//     - example: outlook left-hand tree navigation: top level is a random conglomeration of Inbox,
//       Favorites, etc, each with different child node types (message folders, filesystem folders,
//       etc)
//     - supported: next level is specified via node[this.childNodeType], or via overriding
//       getChildDataSource
//   - mixed type within a level
//     - supported: the Tree just needs a DataSource with a primary key for the level.  Any join
//       that can produce this is fine.

getTreeRelationship : function (parentNode) {
    var childDS = this.getChildDataSource(parentNode);
    // ask the datasource for a tree relationship, which can be declared explicitly or
    // autodetected from field declarations
    var relationship = childDS.getTreeRelationship();
    return relationship;

    
},

//> @method resultTree.getChildDataSource()
// Get the DataSource for children under this node.
//
// If this node has no appropriate child node type, this method will return null - in a multi-DS
// tree this indicates that there is no appropriate next DataSource to navigate to, and this node
// will be a leaf.
//<
// NOTE: nodeDS is an optional parameter, used when we need to know the child datasource of a node
// before it gets linked into the tree (at that time, the node's DS can't be determined by looking
// at it's future parent).
getChildDataSource : function (node, nodeDS) {
    // look for explicitly specified child type 
    var childDSName = node[this.childTypeProperty];
    if (childDSName != null) return isc.DS.get(childDSName);

    // see if there is a mapping from this parent's type to its child type
    var nodeDS = nodeDS || this.getNodeDataSource(node);

    // - if this is a single DS tree, use the one and only DataSource
    // - if we're at root (which is the only node with no DS), use the root DataSource
    if (nodeDS == null || !this.isMultiDSTree()) return this.getRootDataSource();

    // otherwise try to find a relation from this node's DS to some other DS

    // see if there's an explicitly declared tree relation
    var treeRelations = this.treeRelations,
        childDataSources = nodeDS.getChildDataSources();

    //this.logWarn("getChildDataSource: nodeDS is : " + nodeDS + 
    //             ", treeRelations: " + this.echo(treeRelations) + 
    //             ", childDataSources: " + this.echo(childDataSources));

    if (treeRelations) {
        childDSName = treeRelations[nodeDS.ID];
        if (childDSName != null) return isc.DS.get(childDSName);
    }
    // otherwise take the first relationship to any other DataSource
    if (childDataSources != null) return childDataSources[0];
},

// get the DataSource for this node
getNodeDataSource : function (node) {
    // check for explicitly specified type (this allows mixed types within a set of children)
    var dsName = node[this.nodeTypeProperty];

    // use the type stored on parent node when this child was fetched
    if (dsName == null) {
        var parentNode = this.getParent(node);
        if (parentNode == null) {
            // the special, singular "root" object has no DataSource 
            return null; 
        } else if (parentNode == this.root) {
            // nodes under root are of the first or "root" DataSource (slightly confusing)
            dsName = this.getRootDataSource().ID;
        } else {
            // when we have a mixture of node types, and the parent stores the type of the
            // child nodes when they are loaded
            dsName = parentNode._derivedChildNodeType;
            // otherwise we have just one node type
            if (dsName == null) dsName = this.getRootDataSource().ID;
        }
    }
    return isc.DS.get(dsName) || this.getRootDataSource();
},

isMultiDSTree : function () {
    return this.multiDSTree || this.treeRelations != null;
},

// get the DataSource for the nodes that appear at root
getRootDataSource : function () {
    if (this.operation && this.operation.dataSource) return isc.DS.get(this.operation.dataSource);
    else return  isc.DS.get(this.dataSource);
},

//> @method resultTree.getCombinedCriteria()
// Returns a copy of all +link{resultTree.criteria, explicit} and 
// +link{resultTree.getImplicitCriteria, implicit} criteria currently applied to 
// this <code>ResultTree</code>. 
// @return (Criteria | AdvancedCriteria) combined criteria
// @visibility external
//<
getCombinedCriteria : function () {
    return this._getCombinedCriteria(this.criteria);
},
_getCombinedCriteria : function (criteria) {
    return isc.DS.compressNestedCriteria(
        this.getDataSource().combineCriteria(this.getImplicitCriteria(true), 
            isc.DataSource.copyCriteria(criteria))
    );
},

// get the criteria to apply (aside from parentId) when selecting children from childDS
getCriteria : function (childDS, parentDS, parentNode) {
    if (this.getRootDataSource() == childDS) return this.criteria;
    return null;
},

// get an operationId to use to select children from childDS.   operation can optionally depend
// on parentDS and parentNode
getOperationId : function (childDS, parentDS, parentNode) {
    // FIXME we may want a declarative way to specify the operation to use to select on each
    // DataSource the tree may encounter
    return this.operation ? this.operation.ID : null;
},

//>	@method resultTree.loadChildren()
// @include tree.loadChildren()
//<

//>	@method resultTree.unloadChildren()
// @include tree.unloadChildren()
//<

_getRelationship : function (parentNode, debugLog) {

    // figure out what parent-child relationship will be used to select children of this node.  
    var isRoot = (parentNode == null || parentNode == this.root),
        relationship;

//    if (debugLog) {
//        this.logWarn(
//            "parentNode: " + this.echo(parentNode) + ", isRoot: " + isRoot);
//    }

    // if we're at root, and this is a multi-DataSource tree, the root-level nodes have no parent
    // dataSource.  We just do a normal select, using only the criteria
    var childDS, parentDS;
    if (isRoot && this.isMultiDSTree()) {
        childDS = this.getRootDataSource();
        parentDS = null;
        // XXX this isn't really a relationship: the singular "root" has no schema, hence there is
        // no "parentDS" or "idField", and in the childDS there is no parentIdField that points to
        // root.  But the notion of "childDS", the DataSource of the nodes being loaded, is still
        // valid.
        relationship = { childDS:childDS }; 
    } else {    
        // otherwise, we detect some relationship that this node has either within its own
        // DataSource or across DataSources, and load children using that relationship
        relationship = this.getTreeRelationship(parentNode);
        childDS = relationship.childDS;
        parentDS = relationship.parentDS;
    }

    if (!this.isMultiDSTree()) {
        // force local overrides of idField, parentIdField and rootValue on the relationship -
        // these are autodetected and initialized in init() if unset on this ResultTree.
        relationship.idField = this.idField;
        relationship.parentIdField = this.parentIdField;
        relationship.rootValue = relationship.rootValue;
    }
    if (debugLog && this.logIsDebugEnabled()) {
        this.logDebug("parent id: " + (isRoot ? "[root]" : parentNode[relationship.idField]) + 
                     " (type: " + (isRoot ? "[root]" : (parentDS ? parentDS.ID : "null")) + ")" +
                     " has childDS: " + childDS.ID +
                     ", relationship: " + this.echo(relationship));
    }
    return relationship;
},

//> @attr resultTree.useSimpleCriteriaLOD (boolean : false : IRWA)
// Whether or not we should skip promotion of a simple criteria to an +link{AdvancedCriteria}
// when sending the +link{DSRequest} to load the children of a node in a +link{loadDataOnDemand}
// or +link{resultTree.fetchMode,fetchMode:"paged"} <code>ResultTree</code>.  If the
// +link{DSRequest.textMatchStyle} is not "exact", we normally convert the simple criteria to an
// +link{AdvancedCriteria} for correctness in matching the node name, but setting this property
// to <code>true</code> will allow that to be skipped for backcompat with older releases.
//
// @see treeGrid.autoFetchTextMatchStyle
// @see dataSource.defaultTextMatchStyle
// @visibility external
//<
//useSimpleCriteriaLOD: null,


_getLoadChildrenCriteria : function (parentNode, relationship, debugLog) {

    // put together criteria that should always be used when selecting against this DataSource
    var isRoot = (parentNode == null || parentNode == this.root),
        childDS = relationship.childDS,
        parentDS = relationship.parentDS,
        criteria = {};

    if (!this.isLocal()) {
        // no local filtering - send all criteria to the server
        criteria = isc.addProperties({}, this.getCriteria(childDS, parentDS, parentNode));
        criteria = isc.DS.checkEmptyCriteria(criteria) || {};
    } else if (this._serverCriteria != null) {
        criteria = isc.addProperties({}, this._serverCriteria);
    }

    var emptyCrit = isc.isAn.emptyObject(criteria);
    var advancedCrit = !emptyCrit && isc.DS.isAdvancedCriteria(criteria);

    if (isRoot && this.isMultiDSTree()) {
        // leave criteria alone
    } else if (this.loadDataOnDemand || this.isPaged()) {
        // loadOnDemand: instead of loading the whole tree, only load the children of a single
        // node.  Put together criteria that will find all records from the childDS that belong
        // under this parent record (eg lineItems in a salesOrder)
        
        var parentIdFieldValue = parentNode[relationship.idField];
        // Note: If we're loading the children of the root node, default to the
        // rootValue as specified at the dataSource level if no rootValue was specified directly
        // on the tree
        var undef;
        if (isRoot && parentIdFieldValue === undef) {
            parentIdFieldValue = relationship.rootValue;
        }

        if (!advancedCrit && !this.useSimpleCriteriaLOD) {
            // simple crit and not enforcing simple crit for node children fetches
            
            var context = this.context,
                textMatchStyle = context && context.hasOwnProperty("textMatchStyle") ?
                    context.textMatchStyle : childDS && childDS.defaultTextMatchStyle;
            if (textMatchStyle != "exact") {
                // the crit will be advanced shortly
                advancedCrit = true;
                // non-"exact" textMatchStyle (ie, from fetches other than the initial one) - 
                // if there's criteria, convert it to advanced - otherwise, create a dummy 
                // advanced crit to ease criteria combination below
                if (!emptyCrit) criteria = isc.DS.convertCriteria(criteria, textMatchStyle, relationship.childDS);
                else criteria = { _constructor: "AdvancedCriteria", operator: "and", criteria:[] };
            }
        }

        if (advancedCrit) {
            criteria = isc.DataSource.combineCriteria(
                criteria, 
                {
                    _constructor: "AdvancedCriteria", 
                    fieldName: relationship.parentIdField, 
                    value: parentIdFieldValue, 
                    operator: "equals"
                },
                "and"
            );
        } else {
            criteria[relationship.parentIdField] = parentIdFieldValue;
        }
        //if (debugLog) {
        //    this.logWarn("criteria is: " + isc.JSON.encode(criteria));
        //}
    }
    if (advancedCrit) {
        // if the crit is advanced, compress it and remove empty entries
        criteria = isc.DS.compressNestedCriteria(criteria);
        criteria = isc.DS.checkEmptyCriteria(criteria);
    }
    return criteria;
},


_getPagedLineRange : function (start, end, loadingState) {
    if (start >= end) return null

    // narrow the range to the missing records as the ResultSet does
    if (loadingState) {
        
        start = Math.max(loadingState.firstIndexOf(false, start, end), start);
        end = Math.max(loadingState.lastIndexOf(false, start, end) + 1, start + 1);
    }

    var resultSize = this.resultSize,
        radius = (end - start)/2,
        center = (end + start)/2;

    // calculate # of pages required to cover start, end
    var nPages = Math.ceil(radius*2/resultSize);

    // uncomment to avoid paging when request exceeds page size:
    // if (nPages > 1) return [start, end];

    // adjust start, end outward to correspond to page boundaries
    var pagedStart = Math.floor(center - nPages * resultSize / 2),
        pagedEnd   = Math.floor(center + nPages * resultSize / 2);

    // adjust pages upward to ensure start is non-negative
    if (pagedStart < 0) {
        pagedEnd += -pagedStart;
        pagedStart = 0;
    }

    // shift pages to avoid overlapping loading slots if possible
    
    if (loadingState) {
        var desiredStart =  loadingState.lastIndexOf(true, pagedStart, start) + 1,
            desiredEnd   = loadingState.firstIndexOf(true, end, pagedEnd);

        // nothing to do unless our choice of paging picks up some loading slots
        if (desiredStart > 0 || desiredEnd >= 0) {
            
            var downwardLimit = loadingState.lastIndexOf(true, pagedStart - (pagedEnd - end),
                                                               pagedStart) + 1,
                upwardLimit = loadingState.firstIndexOf(true, pagedEnd,
                                                              pagedEnd + (start - pagedStart));

            // limits are indices unless the search failed; convert them each to a slot count
            var startSpace = downwardLimit >  0 ? pagedStart - downwardLimit : pagedEnd - end, 
                  endSpace = upwardLimit   >= 0 ? upwardLimit - pagedEnd : start - pagedStart;

            // clamp the available space by the amount that we actually need to avoid overlap
            startSpace = desiredEnd >= 0 ? Math.min(startSpace,   pagedEnd - desiredEnd) : 0;
            endSpace = desiredStart  > 0 ? Math.min(endSpace, desiredStart - pagedStart) : 0;

            // now we can shift by the optimal amount and direction
            if (endSpace > startSpace) {
                pagedStart += endSpace;
                pagedEnd   += endSpace;            
            } else if (startSpace > 0) {
                pagedStart -= startSpace;
                pagedEnd   -= startSpace;
            }
        }
    }

    return [pagedStart, pagedEnd];
},

// create new request from parent node, dataSources, local/RT context, and base request
_getLoadChildrenRequestPropsFromContext : function (childDS, parentDS, parentNode, 
                                                    internalClientContext, request) 
{
    // combine per-fetch attributes with fixed request and data context
    var requestProperties = isc.addProperties({
        parentNode: parentNode,
        willHandleError: true, // clear up our loading prompt on a server error
        resultTree: this
    }, request, this.context);
    if (this.context && this.context.internalClientContext) {
        internalClientContext = isc.addProperties(
            {}, this.context.internalClientContext, internalClientContext);
    }
    requestProperties.internalClientContext = internalClientContext;

    // get an operation to do a select against the child DS
    var operationId = this.getOperationId(childDS, parentDS, parentNode);
    if (operationId) requestProperties.operationId = operationId;

    return requestProperties
},

// Note this is an internal method to fetch the children and fold them into the children array
// for the node in question. It doesn't check for the children already being loaded - so if
// called repeatedly you'd end up with duplicates in the children array.
_loadChildren : function (parentNode, start, end, callback) {

    var nodeLocator;
    if (this.isANodeLocator(parentNode)) {
        nodeLocator = parentNode;
        parentNode = parentNode.node;
    }

    var relationship = this._getRelationship(parentNode, true),
        childDS = relationship.childDS,
        parentDS = relationship.parentDS;

    // remember the type of children under this parent, because we'll use this to figure out the
    // type of the children's children.
    parentNode._derivedChildNodeType = childDS.ID;

    var isRoot = (parentNode == null || parentNode == this.root),
        criteria = this._getLoadChildrenCriteria(parentNode, relationship, true)
    ;

    if (this.fetchMode == "basic") {
        // for fetchMode "basic", include implicitCriteria along with parentNode criteria
        var implicitCriteria = this.getImplicitCriteria();
        if (implicitCriteria) criteria = parentDS.combineCriteria(criteria, implicitCriteria);
    }

    if (!((isRoot && this.isMultiDSTree()) || this.loadDataOnDemand)) {
        // we're going to fetch the entire tree in one go, so mark everything as loaded
        this.setDefaultLoadState(isc.Tree.LOADED);
    }

    // Remember the parentNode whose children we are loading, and what relationship we used
    // also set up the callback to fire on return.    
    
    var internalClientContext = {
        parentNodeLocator: nodeLocator,
        parentNode: parentNode,
        relationship: relationship,
        childrenReplyCallback: callback
    };

    // If this is the initial fetch, hang a flag on the internalClientContext so we know to
    // fire the initial fetch callback.
    
    if (!this._performedInitialFetch) {
        internalClientContext._isInitialFetch = true;
        this._performedInitialFetch = true;
    }
    
    // Hang onto a unique fetch "id" so if invalidateCache is called before the fetch
    // returns we know the results are essentially invalid.
    var fetchCount = internalClientContext.fetchCount = (++this.currentFetch);

    // create requestProperties for fetch from parent node, dataSources and local/RT context
    var requestProperties = this._getLoadChildrenRequestPropsFromContext(
                                childDS, parentDS, parentNode, internalClientContext);
    
    
    if (this.isPaged()) {
        if (this.keepParentsOnFilter) {
            requestProperties.keepParentsOnFilter = true;
        }

        if (parentNode != null && start != null && end != null) {
            var children = parentNode[this.childrenProperty];
            if (!isc.isA.ResultSet(children) && start < end) {
                // An invalidateCache() call occurring before an initial load returns from the
                // server should also invalidate this tracking of initially loading ranges.
                var loadingState = parentNode[this._initialLoadingStateProperty],
                    loadingFetchCount = parentNode[this._initialLoadingFetchCountProperty],
                    invalidated = (
                        loadingFetchCount != null &&
                        this.invalidatedFetchCount != null &&
                        loadingFetchCount <= this.invalidatedFetchCount),
                    lineRange
                ;
                
                if (loadingState == null || invalidated) {
                    loadingState = isc.BitSet.create();
                    parentNode[this._initialLoadingStateProperty] = loadingState;
                    parentNode[this._initialLoadingFetchCountProperty] = fetchCount;
                    lineRange = this._getPagedLineRange(start, end);
                } else {
                    
                    if (callback == null && loadingState.all(true, start, end)) {
                        return;
                    }
                    // use loadingState to be smarter about how we adjust start, end
                    lineRange = this._getPagedLineRange(start, end, loadingState);
                }
                // update the loading state to track the official start, end range
                loadingState.setRange((start = lineRange[0]), (end = lineRange[1]), true);
            }
        }

        requestProperties.startRow = start;
        requestProperties.endRow   = end;
        requestProperties.sortBy = isc.shallowClone(this._serverSortBy);
    }

    // set the parent as loading
    if (parentNode != null) this.setLoadState(parentNode, isc.Tree.LOADING);

    
    var progressiveLoading = this._getProgressiveLoading(),
        progressiveLoadingProperties = null;
    if (progressiveLoading !== false) {
        var parentOfLastNode = true;
        for (var n = parentNode, p = null; parentOfLastNode && n != null; n = p) {
            p = this.getParent(n);
            if (p == null) {
                parentOfLastNode = true;
            } else {
                var c = this.getChildren(p);
                parentOfLastNode = (c.getLength() == 1 + c.indexOf(n));
            }
        }

        progressiveLoading = parentOfLastNode && progressiveLoading;
        if (progressiveLoading === true || progressiveLoading === false) {
            progressiveLoadingProperties = { progressiveLoading: progressiveLoading };
        }
    } else {
        progressiveLoadingProperties = { progressiveLoading: false };
    }

    if (this.isMultiLinkTree() && this.linkDataFetchMode == "separate") {
        var linkDS = isc.DataSource.get(this.linkDataSource);
        if (!linkDS) {
            this.logWarn("MultiLink tree specifies linkDataFetchMode:separate, but does not " +
                         "provide a valid linkDataSource.  This is not valid, please see the " +
                         "documentation for 'linkDataFetchMode'");
            return;
        }
        var linkCriteria = isc.addProperties({}, criteria);
        if (linkCriteria[this.parentIdField] === null && !this.sendNullParentInLinkDataCriteria) {
            delete linkCriteria[this.parentIdField];
        }
        var linkRequestProperties = this._getLoadChildrenRequestPropsFromContext(
                                    linkDS, linkDS, parentNode, internalClientContext);

        
        var linkOpId = linkRequestProperties.linkDataFetchOperation ||
                       this.linkDataFetchOperation;
        linkRequestProperties.operation = isc.DataSource.makeDefaultOperation(linkDS,"fetch",
                                                linkOpId);
        linkRequestProperties.operationId = linkOpId;
        linkRequestProperties._fetchingAllLinks = (linkCriteria[this.parentIdField] == null);
        var wasAlreadyQueuing = isc.RPCManager.startQueue();
        linkDS.fetchData(linkCriteria, { caller: this, methodName: "loadLinkDataReply" },
            isc.addProperties(linkRequestProperties, progressiveLoadingProperties));

        if (!this.sendLinkDataFieldsInNodeCriteria) {
            criteria = isc.addProperties({}, criteria);
            delete criteria[this.idField];
            delete criteria[this.parentIdField];
            delete criteria[this.linkPositionField];
        }
    }

    // kick off the operation to fetch children
    childDS.fetchData(criteria, { caller: this, methodName: "loadChildrenReply" },
        isc.addProperties(requestProperties, progressiveLoadingProperties));

    if (this.isMultiLinkTree() && this.linkDataFetchMode == "separate") {
        if (!wasAlreadyQueuing) {
            isc.RPCManager.sendQueue();
        }
    }
},
currentFetch:0,

_addChildren : function (parent, newChildren, dsResponse, relationship, request, 
                            localFiltering, fetchingAllLinks)
{

    var parentNodeLocator;
    if (this.isANodeLocator(parent)) {
        parentNodeLocator = parent;
        parent = parent.node;
    }

    if (!isc.isA.Array(newChildren) || newChildren.length == 0) {
        // no new nodes, mark parent as loaded
        if (dsResponse.status == isc.RPCResponse.STATUS_OFFLINE) {
            this.setLoadState(parent, isc.Tree.UNLOADED);
            this.delayCall("closeFolder", [parent], 0);
        } else {
            this.setLoadState(parent, isc.Tree.LOADED);
        }

        if (!isc.isA.Array(newChildren)) {
            if (dsResponse.status < 0) {
                isc.RPCManager._handleError(dsResponse, request);
            } else if (newChildren == null) {
                this.logWarn("passed null children; return empty List instead");
            } else {
                this.logWarn("Unexpected new node format.  Array of new nodes expected, " + 
                             "instead found: " + this.echoLeaf(newChildren));
            }
            newChildren = [];
        }
    }

    if (this.isMultiLinkTree() && this.linkDataFetchMode == "single") {
        this._extractLinkData(newChildren);
    }

    
    this._lastOperation = dsResponse.operationType;

    if (this.isPaged()) {
        var numResults = newChildren.length;

        // if server did not specify startRow then assume that startRow is what was asked for
        var startRow = dsResponse.startRow != null ? dsResponse.startRow : request.startRow;

        // if server didn't specify endRow, assume it's startRow plus number of records returned
        var endRow = dsResponse.endRow != null ? dsResponse.endRow : startRow + numResults;

        // if the server did not specify totalRows but the resulting endRow is less than what we
        // asked for then we know that server doesn't have more rows, so set totalRows to endRow
        var totalRows = dsResponse.totalRows == null && endRow < request.endRow ?
                                                        endRow : dsResponse.totalRows;

        var children = parent[this.childrenProperty];
        if (isc.isA.ResultSet(children)) {
            
        } else if (endRow < totalRows && numResults > 0) {
            parent[this.childCountProperty] = totalRows;
            var grandParent = this.getParent(parent),
                origParentLength = grandParent != null &&
                              this._getNodeLengthToParent(parent, grandParent);
            
            children = this._canonicalizeChildren(parent, parent[this.childrenProperty], 
                                                  false, true);
            
            children.fillCacheData(newChildren, startRow);
        } else {
            if (children != null) {
                var existingNodes = children.getRange(startRow, endRow);
                for (var i = existingNodes.length; i--; ) {
                    this._remove(existingNodes[i]);
                }
            }
            this._addList(newChildren, parent, startRow);
        }
    } else if (this.isMultiDSTree()) {
        for (var i = 0; i < newChildren.length; i++) {
            var node = newChildren[i];
            // in a multi-DS tree, a node is a folder if there's a childDS to fetch nodes from
            var nextChildDS = this.getChildDataSource(node, relationship.childDS);
            if (nextChildDS != null) this.convertToFolder(node);

            // Node naming:
            // - in a single-DS tree, all nodes have an id that is unique tree-wide, the
            //   "idField" from the tree relationship
            // - in a multi-DS tree, nodes are from a mix of DataSources and do not necessarily
            //   have a tree-wide unique id - they only have a unique id within each set of
            //   children, since each set of children can be from a different DataSource
            //   (even when on the same level).
            // 
            // So, for multiDSTrees, in this case all newNodes are immediate children
            //
            // link it in
            this._add(node, parent);
        }
    } else {
        // we're dealing with a mixed bag of parents and children, any number of levels deep.
        // In this case we assume a unique id across all tree nodes, as opposed to just one
        // level, and run a linking algorithm that can handle the nodes in any order.
        
        if (dsResponse.status == isc.RPCResponse.STATUS_OFFLINE) {
            this.setLoadState(parent, isc.Tree.UNLOADED);
            this.delayCall("closeFolder", [parent], 0);
        } else {
            // if we are filtering locally, postpone dataChanged event until we finish filtering
            var suppressDataChanged = localFiltering;
            this._linkNodes(newChildren, relationship.idField,   relationship.parentIdField,
                                         relationship.rootValue, relationship.isFolderProperty,
                                         parentNodeLocator || parent, suppressDataChanged, null,
                                         !fetchingAllLinks);
        }
    }

    // clear current operationType
    delete this._lastOperation;
},

loadLinkDataReply : function(dsResponse, data, dsRequest) {
    // Discard the response if invalidateCache was called while we were fetching
    var context = dsResponse.internalClientContext,
        fetchCount = context.fetchCount;
    if (this.invalidatedFetchCount != null && fetchCount <= this.invalidatedFetchCount) {
        return;
    }

    if (!this.linkData) this.linkData = [];

    if (!data || data.length == 0) {
        this.logDebug("Multi-link tree: fetch on the linkDataSource returned a null or empty " + 
                 "response (this may be perfectly valid, since we may have just tried to " +
                 "fetch the children of a node whose folderness was unknown - we have now " +
                 "discovered that it is actually a leaf)");
    } else {
        this.linkData.addAll(data);
    }
},

_extractLinkData : function(data) {
    if (!this.linkData) this.linkData = [];
    var idField = this.linkIdField != null ? this.linkIdField : this.idField,
        pidField = this.linkParentIdField != null ? this.linkParentIdField : this.parentIdField,
        posField = this.linkPositionField;
        for (var i = 0; i < data.length; i++) {
            var linkRecord = {};
            linkRecord[idField] = data[i][idField];
            linkRecord[pidField] = data[i][pidField];
            linkRecord[posField] = data[i][posField];
        if (linkRecord[idField] == null) {
            this.logWarn("Multi-link tree with linkDataFetchMode:single must embed link information " +
                        "in the data records.  This means that both '" + idField + "' and '" +
                        pidField + "' must be provided in every data record, but this record " +
                        "does not meet that requirement: " + isc.echo(data[i]));
            continue;
        }

        // Populate any additional link properties
        var linkDs = isc.DataSource.get(this.linkDataSource);
        if (linkDs) {
            var fields = linkDs.getFieldNames();
            var undef;
            for (var j = 0; j < fields.length; j++) {
                if (fields[j] != idField && fields[j] != pidField && fields[j] != posField &&
                        data[i][fields[j]] !== undef)
                {
                    linkRecord[fields[j]] = data[i][fields[j]];
                }
            }
        }

        this.linkData.add(linkRecord);
    }
},

loadChildrenReply : function (dsResponse, data, request) {
    var context = dsResponse.internalClientContext,
        parentNode = context.parentNode;

    
    if (parentNode != null && this.isPaged()) {
        delete parentNode[this._initialLoadingStateProperty];
        delete parentNode[this._initialLoadingFetchCountProperty];
    }

    // If 'invalidateCache' was called while a fetch was in operation, ignore the
    // response.
    
    var fetchCount = context.fetchCount;
    if (this.invalidatedFetchCount != null && fetchCount <= this.invalidatedFetchCount) {
        return;
    }

    
    if (!this.isMultiLinkTree()) {
	    var ancestor = parentNode,
	        greatAncestor;
	    while ((greatAncestor = this.getParent(ancestor)) != null) {
	        ancestor = greatAncestor;
	    }
	    if (ancestor !== this.getRoot()) {
	        return;
	    }
    } else {
        if (context.parentNode) {
            context.parentNode = this._getNodeFromIndex(context.parentNode)
            if (!context.parentNodeLocator) {
                context.parentNodeLocator = this.createNodeLocator(context.parentNode, null, null, context.parentPath);
            }
        }
	    var ancestor = context.parentNodeLocator,
	        greatAncestor;
	    while ((greatAncestor = this.getParent(ancestor)) != null) {
	        var parentPath = this._deriveParentPath(ancestor.path);
	        ancestor = this.createNodeLocator(greatAncestor, null, null, parentPath);
	    }
	    if (ancestor.node !== this.getRoot()) {
	        return;
	    }
    }

    // Are we filtering data locally?
    var localFiltering = (this.isLocal() && 
            this.haveCriteria(this._localFilter || this.getCombinedCriteria()));

    // incorporate the new records into the tree
    var relationship = context.relationship,
        newNodes = dsResponse.data;

    // if we're returned an error handle it as if we were returned no data, then
    // call the standard RPCManager error handling code
    if (dsResponse.status < 0) newNodes = null;

    // if we're returned the STATUS_OFFLINE condition, handle it as an empty dataset
    if (dsResponse.status == isc.RPCResponse.STATUS_OFFLINE) {
        newNodes = [];
        if (parentNode != null && !this.isRoot(parentNode)) {
            isc.say(window[request.componentId].offlineNodeMessage);
        }
    }

    // Determine target tree for this new data.
    // Re-target our parentNode if using a different tree.
    var tree = this;
    var parentNodeLocator = context.parentNodeLocator;
    if (localFiltering) {
        // Link new data into the complete tree
        if (!this.completeTree) this.completeTree = this.duplicate(true, true, true);
        tree = this.completeTree;

        var parentPath = this.getPath(parentNode);
        parentNode = tree.find(parentPath);

        // new locator within the 'completeTree'
        if (tree.isMultiLinkTree()) {
            parentNodeLocator = tree.createNodeLocator(parentNode, null, null, parentPath);
        }
    }
    // add newNodes to tree, handling the various tree modes and allowed newNodes data formats
    tree._addChildren(parentNodeLocator || parentNode, newNodes, dsResponse, 
                                    relationship, request, localFiltering, 
                                    request._fetchingAllLinks);

    // If filtering locally, do it now.
    if (localFiltering) {
        // If we didn't set up the "openStateForLoad" flag, do it now.
        if (this._openStateForLoad == null) this._openStateForLoad = this._getOpenState();
        this.filterLocalData();
    }
    // Reopen any nodes after cache is filled
    if (this._openStateForLoad) {
        // NOTE: filterLocalData() has relinked the tree, so the nodes are now different 
        // objects than the nodes we stored in the _openStateForLoad variable.  For multiLink
        // trees, this is significant because it means that node lookups in the index
        // will fail.  So refresh the cached openState from the current nodeIndex
        var openState = this._openStateForLoad;
        if (this.isMultiLinkTree()) {
            for (var i = 0; i < openState.length; i++) {
                openState[i].node = this._getNodeFromIndex(openState[i].node);
                
                this.setLoadState(openState[i].node, isc.Tree.LOADED)
            }
        }
        this._setOpenState(this._openStateForLoad, true);
        delete this._openStateForLoad;
    }

    // Fire any callback passed to 'loadChildren' in the scope of this tree.
    if (context.childrenReplyCallback) {
        this.fireCallback(context.childrenReplyCallback, "node", [parentNode], this);
    }
    
    // NOTE: when paging within child sets is implemented, we'll add "startChild,endChild" to
    // this signature
    if (this.dataArrived != null) {
        this.dataArrived(parentNode);
    }
},

//>	@method	resultTree.setChildren()
// Replaces the existing children of a parent node.  This leaves the node in the loaded state
// (unless a partially loaded set of children is specified using the optional
// <code>totalChildren</code> argument).
// 
// The supplied array of children may be null or empty to indicate there are none, but
// if present must be in the standard format as would be sent from the server, as described
// by +link{group:treeDataBinding}.
// <P>
// In particular, note that for a +link{resultTree.fetchMode,paged} <code>ResultTree</code>,
// each child node:<ul>:
// <li>can have nested children spcified under the +link{tree.childrenProperty} (but not via
// +link{treeNode.id}/+link{treeNode.parentId} linking)
// <li>cannot be open unless it includes either a complete set of children, or partial set of
// children and a childCount</ul>
//
// @param parent                (TreeNode) parent of children
// @param newChildren   (List of TreeNode) children to be set
// @param [totalChildren]        (Integer) number of total children (if not all have been
//                                         provided as newChildren); only allowed if paging
//
// @see tree.removeChildren()
// @see dataSource.updateCaches()
//
// @group loadState
// @visibility external
//<
setChildren : function (parent, newChildren, totalChildren) {
    // remove current children
    this.removeChildren(parent);

    // ensure a valid length is installed into totalChildren
    if (totalChildren == null) {
        totalChildren = isc.isAn.Array(newChildren) ? newChildren.length : 0;
    }
    // install new children underneath the parent node; requires server formatting of children
    this._addChildren(parent, newChildren, {startRow: 0, totalRows: totalChildren},
                      this._getRelationship(parent));
},

// Cache sync
// ------------------------------------
// On initial load of data for some folder, we always retrieve the entire set of children for the
// parents of the node.
// When dataChanged fires on our dataSource, we need to update these stored children arrays to
// incorporate the modified nodes into our tree of local data.

// helper method to get this.dataSource as a datasource object (even if specified as an ID only)
getDataSource : function () {
    return isc.DataSource.getDataSource(this.dataSource);
},

getLinkDataSource : function () {
    if (!this.isMultiLinkTree()) return null;
    return this.linkDataSource ? isc.DataSource.getDataSource(this.linkDataSource) : null;
},

//> @method resultTree.invalidateCache() [A]
// Manually invalidate this ResultTree's cache.
// <P>
// Generally a ResultTree will <smartclient>observe</smartclient><smartgwt>detect</smartgwt>
// and incorporate updates to the DataSource that provides its
// records, but when this is not possible, <code>invalidateCache()</code> allows manual cache
// invalidation.
// <P>
// Components bound to this ResultTree will typically re-request the currently visible portion
// of the dataset, causing the ResultTree to re-fetch data from the server.
// @visibility external
//<
invalidateCache : function () {
    if (!this.isLoaded(this.root)) return;

    // If we're doing local fetches drop our "completeTree" so we rebuild on fetch
    if (this.completeTree) delete this.completeTree;
    
    // Ensure that if a current fetch is in progress, we ignore its response in favor
    // of the new results.
    this.invalidatedFetchCount = this.currentFetch;
    
    // Save current open state so it can be reapplied when new data arrives
    this._openStateForLoad = this._getOpenState(true);
    // reset autoName to zero.
    
    this._autoName = 0;
    
    if (this.isMultiLinkTree()) {
        this.data = [];
    }

    // Reset root to refetch all our data.
    this.setRoot(this.makeRoot(), true);

    
    if (!this.loadDataOnDemand) {
        this.reloadChildren(this.root);
    }
},

dataSourceDataChanged : function (dsRequest, dsResponse) {

    // respect the flag to suppress cache sync altogether
    if (this.disableCacheSync) return;
    
    var updateData = isc.DataSource.getUpdatedData(dsRequest, dsResponse, 
                                                   this.updateCacheFromRequest, true);
    var context = {};
    if (this.isMultiLinkTree()) {
        context.nodeLocator = dsRequest.nodeLocator;
        context.position = dsRequest.position;
    }
    this.handleUpdate(dsRequest.operationType, updateData, dsResponse.invalidateCache, context);
},

handleUpdate : function (operationType, updateData, forceCacheInvalidation, context) {
    if (isc._traceMarkers) arguments.__this = this;

    var dropCacheOnUpdate = (
            this.dropCacheOnUpdate || forceCacheInvalidation ||
            
            (this.isPaged() && this.keepParentsOnFilter));
    if (dropCacheOnUpdate) {
        

        this.invalidateCache();

        
        if (!this.getDataSource().canQueueRequests) this.dataChanged();
        return;
    }
    // update our cached tree directly  Note our cache is filtered, so we may just discard the
    // update if the new row doesn't pass the filter
    
    this.updateCache(operationType, updateData, context);
    this.dataChanged(operationType);
},


// updateCache() - catch-all method fired when the dataSource dataChanged method fires.
// Integrates (or removes) the modified nodes into our local tree of data.
updateCache : function (operationType, updateData, context) {
    if (updateData == null) return;
    

    operationType = isc.DS._getStandardOperationType(operationType);

	if (!isc.isAn.Array(updateData)) updateData = [updateData];

	//>DEBUG
    if (this.logIsInfoEnabled()) {
        this.logInfo("Updating cache: operationType '" + operationType + "', " + 
                     updateData.length + " rows update data" +
                     (this.logIsDebugEnabled() ? 
                      ":\n" + this.echoAll(updateData) : ""));
    } //<DEBUG

	switch (operationType) {
	case "remove":
        this.removeCacheData(updateData, context);
		break;
	case "add":
        this.addCacheData(updateData, context);
		break;
	case "replace":
	case "update":
        this.updateCacheData(updateData, context);
		break;
	}

},


_sortUpdateDataAncestorsLast : function (updateData) {
    var updateIds = {},
        idField = this.idField
    ;
    // create map of node IDs to updateData index
    for (var i = 0; i < updateData.length; i++) {
        var updateRow = updateData[i];
        if (!updateRow) continue;
        var id = updateRow[idField];
        if (id != null) updateIds[id] = i;
    }
    // arrange parent after child in updateData
    var parentIdField = this.parentIdField;
    for (var i = updateData.length - 1; i >= 0; i--) {
        var updateRow = updateData[i],
            parentId = updateRow[parentIdField],
            parentIndex = updateIds[parentId];
        if (parentIndex != null && parentIndex < i) {
            // swap the parent and child in updateData
            updateData[i] = updateData[parentIndex];
            updateData[parentIndex] = updateRow;
            // ensure that updateIds remains valid
            updateIds[updateRow[idField]] = parentIndex;
            updateIds[parentId] = i++;
        }
    }
},


_addValidParentsAndSort : function (validRows, updateData) {
    // ensure validRows is initially ordered right
    this._sortUpdateDataAncestorsLast(validRows);

    var updateIds = {},
        idField = this.idField
    ;
    // create lookup table of updateData by ID
    for (var i = 0; i < updateData.length; i++) {
        var updateRow = updateData[i];
        if (!updateRow) continue;
        var id = updateRow[idField];
        if (id != null) updateIds[id] = updateRow;
    }

    var validIds = {},
        parentIdField = this.parentIdField
    ;
    // create lookup table of validRows by ID
    for (var i = 0; i < validRows.length; i++) {
        var validRow = validRows[i];
            id = validRow[idField];
        if (id != null) validIds[id] = validRow;
    }
    // for each validRow, add its parent if not already in validRows;
    // this will automatically extend the existing ancestors-last order
    for (var i = 0; i < validRows.length; i++) {
        var validRow = validRows[i],
            parentId = validRow[parentIdField];
        if (parentId != null && !validIds[parentId] && updateIds[parentId]) {
            validRows.add((validIds[parentId] = updateIds[parentId]));
        }
    }
},

addCacheData : function (updateData) {
	if (!isc.isAn.Array(updateData)) updateData = [updateData];

    var undef,
        criteria = (this._localCriteria || this.getCombinedCriteria()),
        haveCriteria = this.haveCriteria(criteria),
        pk = this.getDataSource().getPrimaryKeyFieldNames()[0],
        idField = this.idField || pk,
        checkParent = (this.idField != undef && this.parentIdField != undef)
    ;

    

    // if we've got a completeTree, add all the new nodes to its cache
    if (this.completeTree) for (var i = 0; i < updateData.length; i++) {
        var addRow = updateData[i];

        
        if (checkParent && addRow != null && addRow[this.idField] == addRow[this.parentIdField])
        {
            this.logWarn(
                "Invalid attempt to add a node that is specified to be its own parent " +
                "(the '" + this.idField + "' + and '" + this.parentIdField + "' properties " +
                "of the node are both set to " + (addRow[this.idField] == null ? "null" :
                addRow[this.idField].toString()) + ").  Skipping this node.");
            continue;
        }
        this._addNodeToCache(this.completeTree, addRow, idField);
    }

    // now turn to visible tree - remove any rows of new data that don't pass filtering
    var validRows = this.getDataSource().applyFilter(updateData, criteria, this.context);

    // if filtering with keepParentsOnFilter, must extend validRows for matching children
    if (this.keepParentsOnFilter && haveCriteria) {
        this._addValidParentsAndSort(validRows, updateData);
    }

    this.logInfo("Adding rows to cache: " + validRows.length + " of " + updateData.length + 
                 " rows match filter criteria");

    // add most deeply nested ancestors first to visible tree cache
    for (var i = validRows.length - 1; i >= 0; i--) {
        var addRow = validRows[i];

        
        if (checkParent && addRow != null && addRow[this.idField] == addRow[this.parentIdField])
        {
            if (!this.completeTree) this.logWarn(
                "Invalid attempt to add a node that is specified to be its own parent " +
                "(the '" + this.idField + "' + and '" + this.parentIdField + "' properties " +
                "of the node are both set to " + (addRow[this.idField] == null ? "null" :
                addRow[this.idField].toString()) + ").  Skipping this node.");
            continue;
        }
        this._addNodeToCache(this, addRow, idField);
    }
},

_addNodeToCache : function (tree, node, idField) {
    

    var parentId = node[this.parentIdField], parentNode;
    
    if (parentId != null) parentNode = tree.find(idField, parentId);
    else {
        if (this.defaultNewNodesToRoot || tree.rootValue == null) parentNode = tree.getRoot();
        else parentNode = null;
    }
    
    // Duplicate the node when adding it -- this is required to avoid us writing 
    // properties onto the object directly
    // Note: _add() will automatically sort the new node in the children array
    var addNode = (
            parentNode != null &&
            (tree.getLoadState(parentNode) == isc.Tree.LOADED) &&
            
            !(this.isPaged() && isc.isA.ResultSet(this.getChildren(parentNode))));
    if (addNode) {
        node = isc.clone(node);
        tree._add(node, parentNode);
    }
    return addNode;
},

updateCacheData : function (updateData, context) {
	if (!isc.isAn.Array(updateData)) updateData = [updateData];
    //>DEBUG
    var debugTotals = {
        addedRows: 0,
        updatedRows: 0,
        removedRows: 0};
    //<DEBUG

    // Are we filtering data locally?
    var criteria = (this._localCriteria || this.getCombinedCriteria()),
        haveCriteria = this.haveCriteria(criteria);
    

    var undef, mismatchingParents,
        checkParent = (this.idField != undef && this.parentIdField != undef),
        ds = this.getDataSource();

    // sort if filtering with keepParentsOnFilter
    
    if (this.keepParentsOnFilter && haveCriteria) {
        mismatchingParents = [];
        this._sortUpdateDataAncestorsLast(updateData);
    }

    // update the most deeply nested ancestors first
    for (var i = updateData.length - 1; i >= 0; i--) {
        var updateRow = updateData[i],
            matchesFilter = haveCriteria ? ds._hasMatches([updateRow], criteria, this.context) :
                                           true
        ;
        //>DEBUG
        if (this.logIsDebugEnabled() && !matchesFilter) {
            this.logDebug("updated node :\n" + this.echo(updateRow) +
                         "\ndidn't match filter: " + this.echo(criteria));
        }
        //<DEBUG

        if (updateRow == null) {
            continue;
        }

        
        if (!this.isMultiLinkTree() && checkParent &&
            updateRow[this.idField] == updateRow[this.parentIdField])
        {
            this.logWarn(
                "Invalid attempt to update a node where the '" + this.idField + "' and '" +
                this.parentIdField + "' properties of the record are both set to " +
                (updateRow[this.idField] == null ? "null" : updateRow[this.idField].toString()) +
                " (this would reparent the node to itself).  Skipping this node.");
            continue;
        }
        
        // Update cache of the entire tree (all nodes)
        if (this.completeTree) {
            this._updateNodeInCache(this.completeTree, updateRow, true, null, null, context);
        }
        // Update the visible tree
        this._updateNodeInCache(this, updateRow, matchesFilter, criteria, mismatchingParents, context
        //>DEBUG
        , debugTotals
        //<DEBUG
        );
    }
    
    
    if (mismatchingParents) {
        for (var i = 0; i < mismatchingParents.length; i++) {
            var node = mismatchingParents[i];
            if (!node) continue;
            // if the node has no children, remove it
            var children = node[this.childrenProperty];
            if (children == null || children.isEmpty()) {
                // if the parent doesn't match the filter, queue it too
                var parentNode = this.getParent(node);
                if (parentNode && !ds._hasMatches([parentNode], criteria, this.context)) {
                    mismatchingParents.add(parentNode);
                }
                this._remove(node);
                //>DEBUG
                debugTotals.removedRows++;
                //<DEBUG
            }
        }
    }

    //>DEBUG
    if (this.logIsDebugEnabled()) {
        this.logDebug("updated cache: "
             + debugTotals.addedRows + " row(s) added, "
             + debugTotals.updatedRows + " row(s) updated, "
             + debugTotals.removedRows + " row(s) removed.");            
    }
    //<DEBUG
},

_updateNodeInCache : function (tree, updateRow, matchesFilter, criteria, mismatchingParents,
                               context, debugTotals) 
{
    
    var ds = this.getDataSource(),
        pk = ds.getPrimaryKeyFieldNames()[0],
        idField = this.idField || pk,
        node = tree.find(idField, updateRow[idField])
    ;
    // Very likely we'll see null nodes - we probably haven't opened their parent folder yet
    // However - check for the case where we have and if so, add to our data-set
    if (node == null) {
        if (matchesFilter || mismatchingParents) {
            if (this._addNodeToCache(tree, updateRow, idField)) {
                // non-matching; queue new node to check for children preventing its removal
                if (!matchesFilter) mismatchingParents.add(tree.find(idField, updateRow[idField]));

                // This situation is valid - a developer updated a child of a parent we haven't
                // loaded (possibly in another tree on the page) and shifted it into a
                // parent we have loaded
                this.logInfo("updated row returned by server doesn't match any cached row, " +
                             " adding as new row.  idField value: " + this.echo(updateRow[idField]) +
                             ", complete row: " + this.echo(updateRow));
                if (debugTotals) debugTotals.addedRows++;
            }
        }
        return;
    }

    
    
    var paged = this.isPaged(),
        prevSiblings = paged && this.getChildren(this.getParent(node));
    if (matchesFilter || mismatchingParents) {
        // the change may have reparented a node.
        // But not if this is a multiLink tree - change of parent affects linkData, not core 
        // node data
        if (!this.isMultiLinkTree() && updateRow[this.parentIdField] != node[this.parentIdField]) {
            
            var newParentNode = tree.find(this.idField, updateRow[this.parentIdField]);
            if (newParentNode == null && 
                (this.defaultNewNodesToRoot || this.rootValue == null))
            {
                newParentNode = tree.getRoot();
            }

            if (newParentNode == null || (tree.getLoadState(newParentNode) != isc.Tree.LOADED)) {
                if (!(paged && isc.isA.ResultSet(prevSiblings))) {
                    tree._remove(node);
                    if (debugTotals) debugTotals.removedRows++;
                }
                return;
            } else {
                var newSiblings = paged && this.getChildren(newParentNode),
                    add       = !(paged && isc.isA.ResultSet(newSiblings)),
                    remove    = !(paged && isc.isA.ResultSet(prevSiblings))
                ;
                // queue old parent node, if non-matching, to see if it must be removed
                if (remove && mismatchingParents) {
                    
                    var oldParentNode = tree.find(this.idField, node[this.parentIdField]);
                    if (!ds._hasMatches([oldParentNode], criteria, this.context)) {
                        mismatchingParents.add(oldParentNode);
                    }
                }

                if (add && remove) {
                    tree._move(node, newParentNode);
                } else if (add) {
                    tree._add(node, newParentNode);
                } else if (remove) {
                    tree._remove(node);
                }
            }
        }
        // apply all modified fields to the node.
        isc.addProperties(node, updateRow);

        
        var fieldNames = ds.getFieldNames(); 
        for (var i = 0; i < fieldNames.length; i++) {
            var name = fieldNames[i];
            if (!updateRow.hasOwnProperty(name)) delete node[name];
        }
        // non-matching; queue updated node to check for children preventing its removal
        if (!matchesFilter) mismatchingParents.add(node);

        if (debugTotals) debugTotals.updatedRows++;
    } else if (!(paged && isc.isA.ResultSet(prevSiblings))) {
        tree._remove(node);
        if (debugTotals) debugTotals.removedRows++;
    }
},

removeCacheData : function (updateData) {
    if (!isc.isAn.Array(updateData)) updateData = [updateData];

    var pk = this.getDataSource().getPrimaryKeyFieldNames()[0],
        idField = this.idField || pk,
        criteria = (this._localCriteria || this.getCombinedCriteria()),
        haveCriteria = this.haveCriteria(criteria)
    ;
    // Update cache of the entire tree (all nodes)
    
    if (this.completeTree) {
        this._removeNodesFromCache(this.completeTree, updateData, idField);
    }
    // Update the visible tree
    this._removeNodesFromCache(this, updateData, idField, 
        this.keepParentsOnFilter && haveCriteria ? criteria : null);
},

_removeNodesFromCache : function (tree, updateData, idField, criteria) {
    

    // Build list of nodes to be removed
    var paged = this.isPaged(),
        nodes = [];
    for (var i = 0; i < updateData.length; i++) {
        var node = tree.find(idField, updateData[i][idField]);
        if (node == null) {
            this.logWarn("Cache synch: couldn't find deleted node:" + this.echo(updateData[i]));
        } else if (!(paged && isc.isA.ResultSet(this.getChildren(this.getParent(node))))) {
            nodes.add(node);
        }
    }

    // remove nodes
    
    if (criteria) {
        var ds = tree.getDataSource();

        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i],
                parentNode = tree.getParent(node);
            // remove node
            tree._remove(node);
            // if parent has no remaining children and mismatches filter, queue for removal
            if (parentNode) {
                var children = parentNode[tree.childrenProperty];
                if ((children == null || children.isEmpty()) &&
                    !ds._hasMatches([parentNode], criteria, tree.context)) 
                {
                    nodes.add(parentNode);
                }
            }
        }
    } else {
        tree._removeList(nodes);       
    }
},

// Multi-link cache sync
linkDataSourceDataChanged : function (dsRequest, dsResponse) {

    // respect the flag to suppress cache sync altogether
    if (this.disableCacheSync) return;

    // respect the request-level flag to suppress cache sync for this particular request
    if (dsRequest.disableCacheSync) return;
    
    var updateData = isc.DataSource.getUpdatedData(dsRequest, dsResponse, 
                                                   this.updateCacheFromRequest, true);
    var context = {};
    if (this.isMultiLinkTree()) {
        if (dsRequest.clientContext && dsRequest.clientContext.sourceTree) {
            context.sourceTree = dsRequest.clientContext.sourceTree;
        }
        if (dsRequest.clientContext && dsRequest.clientContext.nodeLocator) {
            context.nodeLocator = dsRequest.clientContext.nodeLocator;
        }
        if (dsRequest.clientContext && dsRequest.clientContext.newParent) {
            context.newParent = dsRequest.clientContext.newParent;
        }
        if (dsRequest.clientContext && dsRequest.clientContext.hasOwnProperty("position")) {
            context.position = dsRequest.clientContext.position;
        }
        if (dsRequest.clientContext && dsRequest.clientContext.hasOwnProperty("isDragMove")) {
            context.isDragMove = dsRequest.clientContext.isDragMove;
        }
        if (dsRequest.clientContext && dsRequest.clientContext.newParentNodeLocator) {
            context.newParentNodeLocator = dsRequest.clientContext.newParentNodeLocator;
        }
        if (dsRequest.clientContext && dsRequest.clientContext.hasOwnProperty("sourceRootValue")) {
            context.sourceRootValue = dsRequest.clientContext.sourceRootValue;
        }
    }
    this.handleUpdateLinks(dsRequest.operationType, updateData, dsResponse.invalidateCache, context);
},

handleUpdateLinks : function (operationType, updateData, forceCacheInvalidation, context) {
    if (isc._traceMarkers) arguments.__this = this;

    // WRWRWR - is this necessary for linkData?
/*    var dropCacheOnUpdate = (
            this.dropCacheOnUpdate || forceCacheInvalidation ||
            
            (this.isPaged() && this.keepParentsOnFilter));
    if (dropCacheOnUpdate) {
        

        this.invalidateCache();

        
        if (!this.getDataSource().canQueueRequests) this.dataChanged();
        return;
    } */

    this.updateLinksInCache(operationType, updateData, context);
    this.linkDataChanged(operationType);
},


updateLinksInCache : function (operationType, updateData, context) {
    if (updateData == null) return;
    operationType = isc.DS._getStandardOperationType(operationType);

	if (!isc.isAn.Array(updateData)) updateData = [updateData];

	//>DEBUG
    if (this.logIsInfoEnabled()) {
        this.logInfo("Updating links in cache: operationType '" + operationType + "', " + 
                     updateData.length + " rows update data" +
                     (this.logIsDebugEnabled() ? 
                      ":\n" + this.echoAll(updateData) : ""));
    } //<DEBUG

	switch (operationType) {
    case "remove":
        // If the remove operation is part of a compound drag-move (remove and then re-add), we
        // need to use the Tree.moveList() operation to ensure that child nodes are handled
        // correctly and node open-state is properly re-applied.  So skip the remove in this 
        // case.
        // HOWEVER, if we are syncing a tree other than the tree in which the drag took place,
        // we only want to do this if:
        // - The parent/child relationship exists in this tree (ie, the one we're syncing)
        // - The new parent node also exists in this tree
        // With that combination, we have a move to perform in this tree as well as the original
        // tree.  If the "old" parent/child relationship does not exist, we just need to add the
        // child to the new parent (the remove will no-op).  Ifthe new parent does not exist, 
        // we just need to remove the child from its old location
        var fullRemove = true;
        if (context.isDragMove) {
            if (context.sourceTree == this) {
                // The drag took place within this tree - we definitely want to move
                fullRemove = false;
            } else {
                if (!this._isParentLinkInIndex(context.nodeLocator)) {
                    // Nothing to remove, so we can no-op
                    fullRemove = false;
                } else if (this._getNodeFromIndex(context.newParentNodeLocator)) {
                    // Both old and new parents are in the tree - we need to do a move, so don't
                    // remove the node from its old position
                    fullRemove = false;
                }
            }
        }
        if (fullRemove) {
            this.removeLinksFromCacheData(updateData, context);
        } else {
            // If we didn't run through the full remove logic, we still always  want to remove
            // the link from the local linkData, because that needs to be a faithful copy of
            // what is on the server 
            for (var i = 0; i < updateData.length; i++) {
                var linkIndex = this.linkData.findByKeys(updateData[i], this.linkDataSource);
                if (linkIndex >= 0) {
                    var link = this.linkData.splice(linkIndex, 1)[0];
                }
            }
        }
		break;
    case "add":
        this.addLinksToCacheData(updateData, context);
		break;
	case "replace":
    case "update":
        for (var i = 0; i < updateData.length; i++) {
            var updateRecord = updateData[i];
            var linkIndex = this.linkData.findByKeys(updateData[i], this.linkDataSource);
            var linkRecord = this.linkData[linkIndex];
            if (!linkRecord) {
                this.logWarn("Detected 'update' operation in linkDataSource cache sync, but the " +
                            "link ID " +  updateData[this.linkIdField] + " does not exist in the " +
                            "current link data.  Ignoring.");
            } else if (linkRecord[this.idField] != updateRecord[this.idField] ||
                    linkRecord[this.parentIdField] != updateRecord[this.parentIdField])
            {
                this.logWarn("Detected 'update' operation in linkDataSource cache sync that changes " +
                            "either the child ID or the parent ID.  These kind of updates are " +
                            "not supported - instead, it should be a remove followed by an add");
            } else if (this.allowDuplicateChildren && 
                    linkRecord[this.linkPositionField] != updateRecord[this.linkPositionField])
            {
                this.logWarn("Detected 'update' operation in linkDataSource cache sync that changes " +
                            "the child's position within its parent.  These kind of updates are " +
                            "not supported where allowDuplicateChildren is true - instead, it " + 
                            "should be a remove followed by an add");
            } else {
                // As long as we are not trying to use update to structurally alter the tree, it's OK
                this.updateLinksInCacheData([updateRecord], context);
            }
        }
		break;
	}

},

removeLinksFromCacheData : function (updateData, context) {
    if (!isc.isAn.Array(updateData)) updateData = [updateData];

    var criteria = (this._localCriteria || this.getCombinedCriteria()),
        haveCriteria = this.haveCriteria(criteria);

    if (this.completeTree) {
        this._removeLinksFromCache(this.completeTree, updateData, null, context);
    }
    // Update the visible tree
    this._removeLinksFromCache(this, updateData,
                this.keepParentsOnFilter && haveCriteria ? criteria : null, context);
},

_removeLinksFromCache : function (tree, updateData, criteria, context) {
    

    if (updateData.length == 0) return;

    // Build list of nodes to be removed
    var paged = this.isPaged(),
        links = [];
    if (context.nodeLocator) {
        this._assert(updateData.length == 1);
    } 
    for (var i = 0; i < updateData.length; i++) {
        // This is a remove, so we only have the primaryKey
        var linkIndex = tree.linkData.findByKeys(updateData[i], tree.linkDataSource);
        if (linkIndex < 0) {
            // This is a mainstream case - we might be syncing a tree with the same linkDataSource
            // but a different set of nodes because it has a different rootValue
            //this.logWarn("Trying to remove link record with linkDataSource primaryKey " +
            //                isc.echoLeaf(updateData[i]) + " but no such link record was " +
            //                "found in local linkData.  Ignoring this link remove request.")
            continue;
        }
        var link = tree.linkData.splice(linkIndex, 1)[0];
        var nodeLocator;
        if (context.nodeLocator) {
            nodeLocator = isc.addProperties({}, context.nodeLocator);
        } else {
            var indexEntry = tree._getNodeIndexEntry(link[tree.idField]);
            for (var path in indexEntry.paths) {
                break;
            }
            nodeLocator = tree.createNodeLocator(
                indexEntry.node,
                null,
                null,
                path
            )
        }
        nodeLocator.node = tree._getNodeFromIndex(nodeLocator.node[tree.idField]);
        if (context.hasOwnProperty("sourceRootValue")) {
            if (!tree._adjustPathForRootDifferences(nodeLocator, context.sourceRootValue)) {
                // This nodeLocator could not be adjusted so it applies to this tree.  Seems like 
                // this would only happen in the same circumstances that would cause the above 
                // search for linkIndex to fail
                continue;
            }
        }
        
        if (!tree._isParentLinkInIndex(nodeLocator)) {
            tree.logWarn("Cache sync: couldn't find deleted link:" + this.echo(updateData[i]));
        } else if (!(paged && isc.isA.ResultSet(tree.getChildren(tree._getNodeFromIndex(link[tree.parentIdField]))))) {
            links.add(nodeLocator);
        }
    }

    // remove links
    
    var criteria;
    if (criteria) {
        var ds = tree.getLinkDataSource();

        for (var i = 0; i < links.length; i++) {
            var link = links[i],
                parentNode = tree._getNodeFromIndex(link.parentId);
            // remove node
            tree._remove(link);
            // if parent has no remaining children and mismatches filter, queue for removal
            if (parentNode) {
                var children = parentNode[tree.childrenProperty];
                if ((children == null || children.isEmpty()) &&
                    !ds._hasMatches([parentNode], criteria, tree.context)) 
                {
                    links.add(parentNode);
                }
            }
        }
    } else {
        tree._removeList(links);
    }
},

addLinksToCacheData : function (updateData, context) {
    if (!isc.isAn.Array(updateData)) updateData = [updateData];

    var criteria = (this._localCriteria || this.getCombinedCriteria()),
        haveCriteria = this.haveCriteria(criteria);

    var pk = this.getDataSource().getPrimaryKeyFieldNames()[0],
        idField = this.idField || pk;
    if (this.completeTree) {
        this._addLinksToCache(this.completeTree, updateData, idField, null, context);
    }
    // Update the visible tree
    this._addLinksToCache(this, updateData, idField, 
                this.keepParentsOnFilter && haveCriteria ? criteria : null, context);
},

_addLinksToCache : function (tree, updateData, idField, criteria, context) {
    

    // Build list of nodes to be added
    
    //>DEBUG
    this._assert(!context.isDragMove || updateData.length == 1);
    //<DEBUG
    var paged = tree.isPaged(),
        links = [];
    if (context.isDragMove && context.sourceTree == this) {
        // We're drag-moving, which is implemented as a delete followed by an add.  However, in
        // a multi-link tree we don't want to actually delete the link because that would remove
        // the entry from the nodeIndex, which would mean we lose the node's open state.  So in
        // that case we avoid syncing the delete, which means we should not look for a duplicate
        // here - it will always be there.
        links.add(updateData[0]);
    } else if (context.isDragMove && 
               context.nodeLocator.parentId == context.newParentNodeLocator.node[this.idField])
    {
        // This is a move within the same parent, so it isn't a duplicate
        links.add(updateData[0]);
    } else {
        for (var i = 0; i < updateData.length; i++) {
            var link = updateData[i];
            var nodeLocator = tree.createNodeLocator(
                        link[tree.idField], 
                        link[tree.parentIdField], 
                        link[tree.linkPositionField],
                        "");
            
            // nodeLocator could be null here if the node is not yet part of this tree
            if (nodeLocator != null && tree._isParentLinkInIndex(nodeLocator)) {
                this.logWarn("Cache sync: trying to add duplicate link:" + this.echo(updateData[i]));
            } else if (!(paged && isc.isA.ResultSet(tree.getChildren(tree._getNodeFromIndex(link[tree.parentIdField]))))) {
                links.add(link);
            }
        }
    }

    if (links.length == 0) return;

    if (context.isDragMove) {
        // This is the drag of a single record - even if we dragged a bunch of records, they 
        // will have been sent for server update in a queue of discrete dsRequests
        //>DEBUG
        this._assert(links.length == 1 && context.nodeLocator && context.newParentNodeLocator);
        //<DEBUG
        var link = links[0];
        tree._currentLinkRecord = link;
        // Replace the nodes in the child and parent nodeLocators with the same nodes from this
        // tree's nodeIndex - if we are syncing from one tree to another, these will be  
        // different objects.  But copy the nodeLocators first, otherwise they will be changed
        // in place and any path changes we make further down this method will be treated as if
        // they were the paths on the original nodeLocator.
        var newParentNodeLocator = isc.addProperties({}, context.newParentNodeLocator);
        if (newParentNodeLocator.node[tree.idField] == tree.rootValue) {
            newParentNodeLocator.node = tree.getRoot();
            //newParentNodeLocator.path = tree.pathDelim;
        } else {
            // Parent was a normal node, just look it up in our nodeIndex
            newParentNodeLocator.node = tree._getNodeFromIndex(newParentNodeLocator.node[tree.idField]);
        }

        if (newParentNodeLocator.node == null) {
            // The parent being dragged into is not present in this tree - nothing to do
            return;
        }

        if (!this._adjustPathForRootDifferences(newParentNodeLocator, context.sourceRootValue)) {
            return;
        }

        // We know about the parentNode, but we may be dropping a node onto that parent that we
        // don't currently know about.  If that's the case, we will need to fetch it
        var nodeLocator = isc.addProperties({}, context.nodeLocator);
        nodeLocator.node = tree._getNodeFromIndex(nodeLocator.node[tree.idField]);

        if (nodeLocator.node != null) {
            this._assert(this._adjustPathForRootDifferences(nodeLocator, context.sourceRootValue));
            // The matching remove operation does not remove nodes from the actual tree for a 
            // dragMove operation, but it does remove the link record from the linkData (because
            // that link record genuinely no longer exists - we don't update link records when 
            // a dragMove takes place, we delete the existing link and then create a new one).
            // So here, we are adding the newly created link that replaces the one we removed
            tree.linkData.add(link);
            tree.moveList([nodeLocator], newParentNodeLocator, context.position);
            delete tree._currentLinkRecord;
            return;
        } else {
            // The child being dragged in is not currently present in this tree, so drop 
            // through to the plain add code (we don't need to move it, just hook it up)
        }
    }  // <<< context.isDragMove
    // Adding new link(s)
    var newParentNodeLocator ;
    if (!context.newParentNodeLocator) {
        // This means that we weren't ultimately called by internal code - we probably got here
        // from an application-code call to addData() on the link dataSource 
        // Since we are adding a child, it needs to be added everywhere that parent exists; the 
        // linking code will do this automatically, so all we need is a locator for one 
        // occurence of the parent node (any occurence will do)
        var parentIndexEntry = this._getNodeIndexEntry(links[0][this.parentIdField]);
        if (parentIndexEntry == null) {
            // The parent being dragged into is not present in this tree - nothing to do
            return;
        }
        for (var path in parentIndexEntry.paths) {
            break;
        }
        newParentNodeLocator = this.createNodeLocator(
            parentIndexEntry.node,
            null,
            null,
            path
        )
    } else {
        if (!this._adjustPathForRootDifferences(context.newParentNodeLocator, context.sourceRootValue)) {
            return;
        }
        newParentNodeLocator = context.newParentNodeLocator;
    }
    tree.linkData.addAll(links);
    var nodes = [], missingNodes = [];
    for (var i = 0; i < links.length; i++) {
        var node = tree._getNodeFromIndex(links[i][tree.idField]);
        if (node == null) {
            missingNodes.add(links[i]);
        } else {
            nodes.add(node);
        }
    }
    if (nodes.length > 0) {
        if (newParentNodeLocator.node[tree.idField] == tree.rootValue) {
            nodes.add(tree.getRoot());
        } else {
            nodes.add(tree._getNodeFromIndex(newParentNodeLocator.node[tree.idField]));
        }
        tree._multiLinkNodes(nodes, tree.idField, tree.parentIdField, tree.linkPositionField, 
                                tree.rootValue, tree.isFolderProperty, newParentNodeLocator, 
                                false, links, true);
    }

    if (missingNodes.length > 0) {
        var wasQueueing = isc.RPCManager.startQueue();
        for (var i = 0; i < missingNodes.length; i++) {
            this._fetchMissingNode(tree, missingNodes[i], newParentNodeLocator);
        }
        if (!wasQueueing) isc.RPCManager.sendQueue();
    }

},

updateLinksInCacheData : function (updateData, context) {
    if (!isc.isAn.Array(updateData)) updateData = [updateData];

    var criteria = (this._localCriteria || this.getCombinedCriteria()),
        haveCriteria = this.haveCriteria(criteria);

    if (this.completeTree) {
        this._updateLinksInCache(this.completeTree, updateData, null, context);
    }
    // Update the visible tree
    this._updateLinksInCache(this, updateData, 
                this.keepParentsOnFilter && haveCriteria ? criteria : null, context);
},

_updateLinksInCache : function (tree, updateData, criteria, context) {
    for (var i = 0; i < updateData.length; i++) {
        // ASSERT: this will always succeed, we confirm the record's existence earlier in the flow
        var index = tree.linkData.findByKeys(updateData[i], tree.linkDataSource);
        var oldRecord = tree.linkData[index];
        tree.linkData[index] = updateData[i];
        // Strictly speaking, it shouldn't be necessary to update the indexes even if the position
        // has changed.  We should ignore the value of position in the indexes unless 
        // allowDuplicateChildren is true, and we cannot get to this point if that flag is true
        // (this is enforced earlier in the flow).  However, it's simple enough to update the 
        // indexes and avoids potential confusion
        var positionEntry = tree._getPositionEntryFromIndex(oldRecord[tree.idField], 
                                                            oldRecord[tree.parentIdField]);
        if (positionEntry && positionEntry.position == oldRecord[tree.linkPositionField]) {
            positionEntry.position = updateData[i][tree.linkPositionField];
        }
        for (var j = 0; j < tree.recordNumberToNodeLocatorIndex.length; j++) {
            var entry = tree.recordNumberToNodeLocatorIndex[j];
            if (entry.node[tree.idField] == oldRecord[tree.idField] && 
                    entry.parentId == oldRecord[tree.parentIdField]) 
            {
                entry.position = updateData[i][tree.linkPositionField];
                // Can't stop here, there may be more matches - this is a multiLink tree after all!
            }
        }

        var nodeLocator = tree.createNodeLocator(oldRecord[tree.idField], 
                                                 oldRecord[tree.parentIdField],
                                                 oldRecord[tree.linkPositionField]);
        tree._removeNodeFromLinkDataIndex(nodeLocator);
        nodeLocator.position = updateData[i][tree.linkPositionField];
        tree._addNodeToLinkDataIndex(nodeLocator, updateData[i]);
    }
},

_fetchMissingNode : function(tree, missingNode, newParentNodeLocator) {
    var ds = isc.DataSource.get(this.dataSource), 
        pks = ds && ds.getPrimaryKeyFields(),
        criteria = pks && isc.firstKey(pks) != null && isc.applyMask(missingNode, pks);
    this._assert(criteria != null);
    ds.fetchData(criteria, function(dsResponse, data, dsRequest) {
        if (data && data.length > 0) {
            var nodes = [data[0]];
            if (newParentNodeLocator.node[tree.idField] == tree.rootValue) {
                nodes.add(tree.getRoot());
            } else {
                nodes.add(tree._getNodeFromIndex(newParentNodeLocator.node[tree.idField]));
            }
            tree._multiLinkNodes(nodes, tree.idField, tree.parentIdField, tree.linkPositionField, 
                        tree.rootValue, tree.isFolderProperty, newParentNodeLocator, 
                        false, [missingNode], true);
        } else {
            // What can we do?  The child node ought to be there, but it aint...
        }
    })
},

_adjustPathForRootDifferences : function(nodeLocator, originalRootValue) {
    if (this.rootValue == originalRootValue) return true;
    // If we are syncing from a different tree with a different rootValue, the path on
    // the nodeLocator is going to be incorrect
    var path = nodeLocator.path;
    if (this.rootValue) {
        path = this._trimPathToNewRoot(path, this.rootValue);
    } else {
        path = this._findMatchingPath(nodeLocator.node[this.idField], path, originalRootValue);
    }
    if (path == null) {
        return false;
    }
    nodeLocator.path = path;
    return true;
},

_trimPathToNewRoot : function(path, newRoot) {
    // Trims off the front part of the path - used when syncing from Tree A to Tree B where 
    // Tree B is rooted at some sub-branch of Tree A
    var nodes = path.split(this.pathDelim);
    var index = nodes.indexOf(newRoot);
    if (index == -1) {
        // The new root doesn't appear in the existing path at all - Tree B is not a subtree of 
        // Tree A, at least along this path, it's just a different tree
        return null;
    }
    var newPath = this.pathDelim;
    var elem = 0;
    var offset = this.allowDuplicateChildren ? 2 : 1;
    for (var i = index+offset; i < nodes.length; i++) {
        if (elem++ > 0) newPath += this.pathDelim;
        newPath += nodes[i];
    }
    return newPath;
},

_findMatchingPath : function(nodeId, path, originalRootValue) {
    if (originalRootValue) {
        // The parent node is the parent node - its children are always the same, regardless of
        // the particular occurence.  So here, we only need to know the root node ID.  However,
        // if allowDuplicateChildren is true, the path parsing routines expect node IDs to
        // be qualified with position.  So if the app dev has not set the rootValue of the tree
        // to a qualified value like "theNodeId/0", qualify it.  Note, this is only done for 
        // parsing purposes - the value of the position qualifier we add is of no significance 
        if (this.allowDuplicateChildren && originalRootValue.indexOf(this.pathDelim) == -1) {
            originalRootValue = originalRootValue + this.pathDelim + "not-important";
        }
        path = originalRootValue + (path == this.pathDelim ? "" : path);
    }
    var indexEntry = this._getNodeIndexEntry(nodeId);
    if (indexEntry && indexEntry.paths) {
        for (var key in indexEntry.paths) {
            if (this.parentChildPositionMatch(key, path)) {
                return key;
            }
        }
    }
    return null;
},

// get the title for this node
getTitle : function (node) {
    // look up the node's DataSource and return its title field
    var dataSource = this.getNodeDataSource(node);

    // the special, singular root node has no DataSource
    if (!dataSource) return "root";

    var title = node[dataSource.getTitleField()];
    if (title != null) return title;

    // if there's no title on this node, try not to leave a blank
    return this.Super("getTitle", arguments);
},

// indexOf: As with ResultSets support being passed primaryKey values only as well as pointers 
// to nodes
// Note: This will return the index wrt the visible (open) nodes of the tree. If the node is not
// currently visible, -1 will be returned.
indexOf : function (node, pos, endPos, c, d) {
    var pks = this.getDataSource().getPrimaryKeyFieldNames();
    for (var i = 0; i < pks.length; i++) {
        var pk = pks[i];
        // locate the index with the node's primary key, but don't ever perform a fetch
        if (node[pk] != null) return this.findNextIndex(pos, pk, node[pk], endPos, true);
    }
    
    return this.invokeSuper(isc.ResultTree, "indexOf", node, pos, endPos, c, d);
},


contains : function (node, pos, comparator) {
    var undef;
    if (this.isPaged() && node != null && pos === undef && comparator === undef) {
        var idProperty = this.idField;
        return (node[this.treeProperty] == this.ID && this.nodeIndex[node[idProperty]] == node);
    } else {
        return this.invokeSuper(isc.ResultTree, "contains", node, pos, comparator);
    }
},




getLength : function () {
    var length = this.invokeSuper(isc.ResultTree, "getLength");
    if (this.isPaged() && this._resultSetChildren != null) {
        var root = this.getRoot(),
            defaultChildLength = (
                this.openDisplayNodeType == isc.Tree.FOLDERS_AND_LEAVES ? 1 : 0);

        for (var i = this._resultSetChildren.length; i--; ) {
            var children = this._resultSetChildren[i],
                parent = children._parentNode,
                openSubfoldersAllowed = (
                    parent[this.canReturnOpenSubfoldersProperty] != null ?
                    parent[this.canReturnOpenSubfoldersProperty] : this.canReturnOpenFolders),
                knownLengthNulls = !(openSubfoldersAllowed || defaultChildLength == 0);
            if (!knownLengthNulls) {
                var visible = true;
                for (var p = parent; visible && p != root; p = this.getParent(p)) {
                    visible = p != null && this.isOpen(p);
                }
                if (visible) {
                    length += Math.max(
                        0, children._getCachedLength() - children._getCachedRows());
                }
            }
        }
    }
    return length;
},

//> @method resultTree.get()
// @include tree.get()
// @visibility external
//<

get : function (pos, dontFetch) {
    if (pos < 0) {
        var undef;
        return undef;
    } else {
        return this.getRange(pos, pos + 1, !!dontFetch)[0];
    }
},

// Override Tree.getCachedRow() to get a record at the given position without causing a fetch
// if the record has not yet been loaded.  See ResultSet.getCachedRow().
getCachedRow : function (pos) {
    if (pos < 0) {
        return null;
    } else {
        var record = this.getRange(pos, pos + 1, true)[0];
        if (record != null && record !== isc.ResultTree.getLoadingMarker()) {
            return record;
        } else {
            return null;
        }
    }
},

//> @method resultTree.getRange()
// @include tree.getRange()
// @visibility external
//<
_$getRangeInfoObj: {},
getRange : function (start, end, dontFetch) {
    
    if (start == null) {
        this.logWarn("getRange() called with no specified range - ignoring.");
        return;
    } else if (end == null) {
        end = start + 1;
    }
    if (start < 0 || end < 0) {
        //>DEBUG
        this.logWarn(
            "getRange(" + start + ", " + end + "): negative indices not supported, clamping " +
            "start to 0");
        //<DEBUG
        start = Math.max(start, 0);
    }
    if (end <= start) {
        //>DEBUG
        this.logDebug("getRange(" + start + ", " + end + "): returning empty list");
        //<DEBUG
        return [];
    }

    
    
    var cachedRanges = this._cachedRanges;
    if (cachedRanges != null && cachedRanges.length > 0) {
        var cachedRange = cachedRanges[cachedRanges.length - 1],
            start0 = cachedRange.start;
        if (start0 <= start && end <= cachedRange.end) {
            return cachedRange.range.slice(start - start0, end - start0);
        }
    }

    if (!this.isPaged()) {
        return this.invokeSuper(isc.ResultTree, "getRange", start, end);
    }

    
    if (!dontFetch && this.isLoading(this.root) &&
        this.parallelFetchesRequireRootLoaded !== false)
    {
        var currentIndex = this.currentFetch,
            invalidIndex = this.invalidatedFetchCount
        ;
        if (invalidIndex == null ? currentIndex != null : currentIndex > invalidIndex) {
            if (this.logIsInfoEnabled()) {
    		    this.logInfo("getRange(" + start + ", " + end + "): parallel fetches are " + 
                             "not allowed before the ResultTree root is loaded - not fetching");
            }
            dontFetch = true;
        }
    }

    var loadingMarker = isc.ResultTree.getLoadingMarker(),
        cachedLengthProperty = this._cachedLengthProperty,
        root = this.getRoot(),
        info = {
            range: [],
            rangeLoading: false,
            needQueue: false,
            wasAlreadyQueuing: false,
            dontFetch: dontFetch === true
        }
    ;

    if (end > start) {
        
        if (!(this.openDisplayNodeType != isc.Tree.LEAVES_ONLY && this.showRoot)) {
            // The root is not visible in the open list.  The length of the root includes 1
            // for the root, so shift the requested range by 1 to implement hiding of the root.
            ++start;
            ++end;
        }
        var progressiveLoading = this._getProgressiveLoading();
        var rootNodeLocator;
        if (this.isMultiLinkTree()) {
            rootNodeLocator = this.createNodeLocator(root, null, null, "/");
        }
        this._getRange(root, rootNodeLocator || root, [root], 0, start, end, true, progressiveLoading, false, info);
        
    }
    return info.range;
},


_pushCachedRange : function (start, end) {
    

    

    if (this.isPaged()) {
        if (this._cachedRanges == null) {
            this._cachedRanges = [];
        }
        this._cachedRanges.push({
            start: start,
            end: end,
            range: this.getRange(start, end)
        });
    }
},

_popCachedRange : function (start, end) {
    if (this.isPaged()) {
        
        this._cachedRanges.pop();
        if (this._cachedRanges.length == 0) {
            delete this._cachedRanges;
        }
    }
},


_getRange : function (root, node, children, i, start, end, recursionTopLevel, progressiveLoading, subrangeLoading, info) {
    
    var separateFolders = this.separateFolders,
        foldersBeforeLeaves = separateFolders && this.sortFoldersBeforeLeaves,
        leavesBeforeFolders = separateFolders && !this.sortFoldersBeforeLeaves,
        range = info.range,
        rangeLoading = info.rangeLoading,
        needQueue = info.needQueue,
        dontFetch = info.dontFetch;

    var nodeLocator;
    if (this.isANodeLocator(node)) {
        nodeLocator = node;
        node = node.node;
    }
    

    
    var defaultChildLength = (this.openDisplayNodeType == isc.Tree.FOLDERS_AND_LEAVES ? 1 : 0);

    var allCachedProperty = this._visibleDescendantsCachedProperty,
        cachedLengthProperty = this._cachedLengthProperty,
        treeLoadingMarker = isc.ResultTree.getLoadingMarker(),
        openSubfoldersAllowed = (
            node[this.canReturnOpenSubfoldersProperty] != null ?
            node[this.canReturnOpenSubfoldersProperty] : this.canReturnOpenFolders),
        childrenResultSet = isc.isA.ResultSet(children),
        
        j = i;

    var length = (children == null ? 0 :
            (childrenResultSet ? children._getCachedLength() : children.getLength()));

    
    for (var z = 0; z < (separateFolders ? 2 : 1); ++z) {
        var firstPass = (z == 0),
            justFolders = (firstPass == foldersBeforeLeaves),
            justLeaves = (firstPass == leavesBeforeFolders),
            startedSubrange = false,
            subrangeStart = 0,
            p = 0;

        for ( ; j < end && p < length; ++p) {
            

            
            var child = children.getCachedRow(p);
            
            var childNodeLocator;
            if (this.isMultiLinkTree()) {
                childNodeLocator = this.getNodeLocator(j);
            }
            var cachedFlag = child != null && 
                (!this.isOpen(childNodeLocator || child) || child[allCachedProperty] ||
                 this.hideLoadingNodes && this.isLoading(child));

            if (child == null) {
                
                var firstThreeConditions = (
                    openSubfoldersAllowed || rangeLoading || defaultChildLength == 0);
                if (firstPass && (firstThreeConditions || separateFolders || j >= start)) {
                    if (firstThreeConditions) {
                        if (!rangeLoading) {
                            // Fill in the rest of the range with LOADING markers.
                            for (var r = Math.max(start, j); r < end; ++r) {
                                range[r - start] = treeLoadingMarker;
                            }
                            rangeLoading = info.rangeLoading = true;
                            if (dontFetch) {
                                return;
                            }
                        }
                    } else {
                        
                        subrangeLoading = separateFolders;

                        if (j >= start) {
                            range[j - start] = treeLoadingMarker;
                        }
                    }

                    
                    if (!(dontFetch || startedSubrange)) {
                        startedSubrange = true;
                        subrangeStart = p;
                        if (!needQueue) {
                            info.wasAlreadyQueuing = isc.RPCManager.startQueue();
                            needQueue = info.needQueue = true;
                        }
                    }
                }

                
                j += (separateFolders && firstPass ? 0 : defaultChildLength);

            } else {
                
                if (startedSubrange) {
                    
                    startedSubrange = false;
                    var prevProgressiveLoading = children.progressiveLoading;
                    children.progressiveLoading = false;
                    children.getRange(subrangeStart, p);
                    children.progressiveLoading = prevProgressiveLoading;
                }

                
                if (this.isFolder(child) ? !justLeaves : !justFolders) {
                    var childLength, visibleChild;
                    if (child == root) {
                        childLength = child[cachedLengthProperty];
                        visibleChild = true;
                    } else {
                        childLength = this._getNodeLengthToParent(child, nodeLocator || node);
                        visibleChild = this._isNodeVisibleToParent(child, nodeLocator || node);
                    }
                    var descendantsLength = childLength - (visibleChild ? 1 : 0);
                    if (j >= start && visibleChild && !rangeLoading) {
                        range[j - start] = (subrangeLoading ? treeLoadingMarker : child);
                    }
                    var k = j + (visibleChild ? 1 : 0),
                        l = j + childLength;
                    if (k < end && (!cachedFlag || (l >= start && descendantsLength > 0))) {
                        
                        var grandchildren = this.getChildren(child, null, null, null, null,
                                                             null, null, null, false);
                        this._getRange(
                            root, childNodeLocator || child, grandchildren,
                            k, start, end, false,
                            // Only allow progressive loading mode to be utilized for
                            // loading the last node of the tree or its siblings.
                            (p == length - 1 && progressiveLoading),
                            subrangeLoading,
                            info);
                        rangeLoading = info.rangeLoading;
                        needQueue = info.needQueue;
                        if (dontFetch && rangeLoading) {
                            return;
                        }
                    }
                    j = l;
                }
            }
        }

        if (startedSubrange) {
            
            startedSubrange = false;
            var prevProgressiveLoading = children.progressiveLoading;
            children.progressiveLoading = progressiveLoading;
            children.getRange(subrangeStart, p);
            children.progressiveLoading = prevProgressiveLoading;
        }
    }
    

    if (length == 0 || (childrenResultSet && !children.lengthIsKnown())) {
        if (!rangeLoading) {
            // Fill in the rest of the range with LOADING markers.
            for (var r = Math.max(start, j); r < end; ++r) {
                range[r - start] = treeLoadingMarker;
            }
            rangeLoading = info.rangeLoading = true;
            if (dontFetch) {
                return;
            }
        }

        if (!needQueue) {
            info.wasAlreadyQueuing = isc.RPCManager.startQueue();
            needQueue = info.needQueue = true;
        }

        // Copy the progressiveLoading setting onto the ResultSet for this request only.
        var prevProgressiveLoading;
        if (childrenResultSet) {
            prevProgressiveLoading = children.progressiveLoading;
            children.progressiveLoading = progressiveLoading;
        }

        
        if (separateFolders || (defaultChildLength == 0)) {
            
            if (childrenResultSet) {
                children._fetchAllRemoteData();
            } else {
                this._loadChildren(nodeLocator || node, 0, this.resultSize, null);
            }
        } else if (childrenResultSet) {
            children.getRange(0, end - j);
        } else {
            this._loadChildren(nodeLocator || node, 0, end - j, null);
        }

        // Restore the original progressiveLoading setting.
        if (childrenResultSet) {
            children.progressiveLoading = prevProgressiveLoading;
        }
    }

    if (recursionTopLevel && needQueue && !info.wasAlreadyQueuing) {
        
        isc.RPCManager.sendQueue();
    }
},


_getProgressiveLoading : function () {
    return (this.isPaged() && this.progressiveLoading);
},


_canonicalizeChildren : function (node, children, alreadyInitialized, allowCreateResultSet) {
    

    
    if (isc.isA.ResultSet(children)) {
        node[this.childrenProperty] = children;
        return children;
    } else if (this._linkingNodes === true) {
        return children;
    }

    var childCount = node[this.childCountProperty],
        numChildren = (isc.isAn.Array(children) ? children.length : 0),
        validChildCount = (
            childCount != null &&
            isc.isA.Number(childCount) &&
            Math.floor(childCount) == childCount &&
            childCount >= 0),
        undef
    ;
    
    
    if (allowCreateResultSet === undef) {
        allowCreateResultSet = children != null && !children.isEmpty();
    }

    
    if (this.isOpen(node) && (allowCreateResultSet ? validChildCount && childCount == 0 :
               (validChildCount ? childCount > 0 : children == null || !children.isEmpty())))
    {
        // first time it's a warning, then an info to avoid flooding the dev console
        this.logMessage(this._warnedOfInvalidChildrenOfOpenNode ? isc.Log.INFO : isc.Log.WARN,
                        "Node " + node[this.nameProperty] + " is marked as open but has " +
                        (allowCreateResultSet ? "" : "no ") + "children and " + 
                        (childCount == null ? "no" : childCount + " as the") + " child count;" +
                        " see the RPC Tab of the Developer Console for further details",
                        "nodeFormat");
        this._warnedOfInvalidChildrenOfOpenNode = true;
        // to avoid any sort of infinite fetch cycle, only fetch if children set is null
        if (children == null && childCount != 0 && !allowCreateResultSet) {
            this._loadChildren(node, 0, 1);
        }
    }

    // bail out if the child count is not valid
    if (!validChildCount) return children;

    // a node with no children is always considered loaded if we reach this point
    if (childCount == 0) {
        this.setLoadState(node, isc.Tree.LOADED);
        return [];
    }
    
    // clamp number of passed children to the childCount specified in the node
    if (childCount < numChildren) {
        // first time it's a warning, then an info to avoid flooding the dev console
        this.logMessage(this._warnedOfExcessChildren ? isc.Log.INFO : isc.Log.WARN,
            "The child count of node " + node[this.nameProperty] + " was set to " + childCount +
            ".  The number of children was " + numChildren + ", but the number of children " +
            "can't exceed the child count; clamping the set of children to the child count.",
            "nodeFormat");
        this._warnedOfExcessChildren = true;

        children = node[this.childrenProperty] = children.slice(0, childCount);
    }

    // leaves can't specify any children or a child count other than 0
    if (this.isLeaf(node) && (childCount > 0 || allowCreateResultSet)) {
        // first time it's a warning, then an info to avoid flooding the dev console
        this.logMessage(this._warnedOfInvalidChildrenOfLeafNode ? isc.Log.INFO : isc.Log.WARN,
            "Node " + node[this.nameProperty] + " is marked as a leaf but has " +
            (allowCreateResultSet ? "children specified" : "a child count of " + childCount),
            "nodeFormat");
        this._warnedOfInvalidChildrenOfLeafNode = true;
    }

    if (!this.isLeaf(node) && allowCreateResultSet) {
        

        // Define a list of all of the ResultSets of children.
        this._resultSetChildren = this._resultSetChildren || [];

        
        var openNormalizer = this._openNormalizer,
            sortSpecifiers = this._sortSpecifiers,
            clonedSortSpecifiers = false;
        if (isc.isAn.Array(sortSpecifiers) && openNormalizer != null) {
            for (var i = sortSpecifiers.length; i--; ) {
                var sort = sortSpecifiers[i];
                if (sort != null && sort.normalizer === openNormalizer) {
                    if (!clonedSortSpecifiers) {
                        sortSpecifiers = sortSpecifiers.duplicate();
                        clonedSortSpecifiers = true;
                    }
                    sortSpecifiers[i] = isc.addProperties({}, sort, { normalizer: null });
                }
            }
        }

        
        var dataSource = this.getDataSource(),
            initialData;
        if (this.keepParentsOnFilter) {
            initialData = (children ? children.duplicate() : []);
        } else {
            initialData = dataSource.applyFilter(children, this.getCombinedCriteria(), this.context);
        }
        var initialLength = Math.max(
                initialData.length,
                node[this.childCountProperty] + (initialData.length - numChildren));

        var context = this.context && isc.addProperties({}, this.context);
        if (context) {
            delete context.clientContext;
            delete context.internalClientContext;
        }

        // If keepParentsOnFilter is enabled then the same-named flag is also set on all
        // DSRequests issue by the tree (including all DSRequests issued by any ResultSet of
        // children nodes in the tree).
        if (this.keepParentsOnFilter) {
            context = context || {};
            context.keepParentsOnFilter = true;
        }

        var resultSetConfig = {
            init : function () {
                var tree = this._tree;
                this._parentNode[tree.childrenProperty] = this;

                // Add this ResultSet to the list of ResultSet children.
                if (!tree._resultSetChildren.contains(this)) {
                    tree._resultSetChildren.add(this);
                }

                if (tree.dataArrived != null) {
                    tree.observe(
                        this, "dataArrived", "observer.dataArrived(observed._parentNode)");
                }

                // Cache criteria that enforces the tree relationship.
                var node = this._parentNode,
                    relationship = tree._getRelationship(node, false);
                this._loadChildrenCriteria = tree._getLoadChildrenCriteria(
                        node, relationship, false);

                var ret = this.Super("init", arguments);

                
                var parent = this._parentNode,
                    grandParent = parent != tree.root && tree.getParent(parent),
                    openSubfoldersAllowed = (
                        parent[tree.canReturnOpenSubfoldersProperty] != null ?
                        parent[tree.canReturnOpenSubfoldersProperty] : tree.canReturnOpenFolders),
                    defaultChildLength = (
                        tree.openDisplayNodeType == isc.Tree.FOLDERS_AND_LEAVES ? 1 : 0),
                    knownLengthNulls = !(openSubfoldersAllowed || defaultChildLength == 0);
                if (knownLengthNulls) {
                    var origLength = (
                            grandParent &&
                            tree._getNodeLengthToParent(parent, grandParent));
                    parent[tree._cachedLengthProperty] = tree._getNodeLength(parent);
                    if (grandParent) {
                        var deltaLength = (
                                tree._getNodeLengthToParent(parent, grandParent) - origLength);
                        tree._updateParentLengths(grandParent, deltaLength);
                    }
                }

                
                if (this._alreadyInitialized) {
                    this.addProperties(tree._childrenResultSetProperties);
                }
                delete this._alreadyInitialized;

                return ret;
            },

            
            _tree: this,
            _parentNode: node,

            _alreadyInitialized: alreadyInitialized,

            dataSource: dataSource,
            criteria: this.criteria,
            context: context,
            fetchDelay: this.fetchDelay,
            disableCacheSync: this.disableCacheSync,
            updateCacheFromRequest: this.updateCacheFromRequest,
            sortSpecifiers: sortSpecifiers,

            initialData: initialData,
            initialLength: initialLength,

            
            setCriteria : function (newCriteria) {
                var tree = this._tree;
                newCriteria = arguments[0] = tree._combineCriteria(
                    newCriteria, this._loadChildrenCriteria);
                return this.Super("setCriteria", arguments);
            }
        };

        if (this.keepParentsOnFilter) {
            
            resultSetConfig.dropCacheOnUpdate = true;
        }

        if (!alreadyInitialized) {
            isc.addProperties(resultSetConfig, this._childrenResultSetProperties);
        }

        children = node[this.childrenProperty] = isc.ResultSet.create(resultSetConfig);

        // The ResultSet currently has only a partial cache of the children of the node, so
        // mark the node as partially loaded.
        this.setLoadState(node, isc.Tree.LOADED_PARTIAL_CHILDREN);

        this._setVisibleDescendantsCached(node, false, null, false);

        
    }
    return children;
},

// check for actions pending by ResultSets owned by this ResultTree
_pendingResultSetActionOnPause : function (id) {
    var actions = this.getClass()._actionsOnPause[id];
    if (!actions) return false;
    // search for ResultSets with specified id action pending
    for (var id in actions) {
        var resultSet = window[id];
        if (isc.isA.ResultSet(resultSet) && resultSet._tree == this) {
            return true;
        }
    }
    return false;
},


_combineCriteria : function (criteria1, criteria2) {
    var criteria1Null = (criteria1 == null || isc.isAn.emptyObject(criteria1)),
        criteria2Null = (criteria2 == null || isc.isAn.emptyObject(criteria2));
    if (criteria1Null || criteria2Null) {
        if (!criteria1Null) {
            return criteria1;
        } else if (!criteria2Null) {
            return criteria2;
        } else {
            return (criteria1 || criteria2);
        }
    }

    var advanced = (
        (isc.DS && (isc.DS.isAdvancedCriteria(criteria1) || isc.DS.isAdvancedCriteria(criteria2))) ||
        (criteria1._constructor == "AdvancedCriteria" || criteria2._constructor == "AdvancedCriteria")
    );
    if (!advanced) {
        var cloned = false;
        for (var key in criteria1) {
            if (criteria2[key] != null) {
                if (criteria2[key] !== criteria1[key]) {
                    advanced = true;
                } else {
                    if (!cloned) {
                        criteria2 = isc.addProperties({}, criteria2);
                        cloned = true;
                    }
                    delete criteria2[key];
                }
            }
        }
    }

    var combinedCriteria = isc.DataSource.combineCriteria(criteria1, criteria2, "and");
    
    advanced = (combinedCriteria._constructor == "AdvancedCriteria");

    // Fix instances of { operator: "iContains", value: null } in advanced
    // criteria to use the "isNull" operator instead.
    if (advanced && isc.isAn.Array(combinedCriteria.criteria)) {
        var subcriteria = combinedCriteria.criteria;
        for (var i = subcriteria.length; i--; ) {
            var subcriterion = subcriteria[i];
            if (subcriterion.operator == "iContains" && subcriterion.value == null) {
                subcriterion.operator = "isNull";
                delete subcriterion.value;
            }
        }
    }

    return combinedCriteria;
},

// Override Tree.setSort() to call setSort() on any ResultSets of children in paged trees.
setSort : function (sortSpecifiers) {
    var ret = this.invokeSuper(isc.ResultTree, "setSort", sortSpecifiers);
    sortSpecifiers = this._sortSpecifiers; // set by Tree.setSort()

    // update sortBy parameter (added to DSRequests when children are fetched)
    this._serverSortBy = sortSpecifiers ? isc.DS.getSortBy(sortSpecifiers) : null;

    if (this.isPaged()) {
        var resultSetChildren = this._resultSetChildren;

        if (resultSetChildren != null && resultSetChildren.length > 0) {
            var wasAlreadyQueuing = isc.RPCManager.startQueue();

            for (var i = resultSetChildren.length; i--; ) {
                var children = resultSetChildren[i];
                children.setSort(sortSpecifiers);
            }

            if (!wasAlreadyQueuing) {
                isc.RPCManager.sendQueue();
            }
        }
    }

    return ret;
},

_getStartRow : function (node) {
    if (node == null) {
        return null;
    }

    var root = this.getRoot(),
        parent = null,
        start = 0;

    for ( ; node != root; node = parent) {
        parent = this.getParent(node);
        if (parent != null) {
            if (!this._includeNodeLengthInParent(node, parent)) {
                return null;
            }

            var children = this.getChildren(parent),
                j = children.indexOf(node);

            if (j == -1) {
                return null;
            }

            for (var i = 0; i < j; ++i) {
                var child = children.getCachedRow(i);
                if (child != null) {
                    start += this._getNodeLengthToParent(child, parent);
                }
            }

            if (this._isNodeVisibleToParent(node, parent)) {
                ++start;
            }
        } else if (node != root) {
            // The node is not actually in the tree!
            var undef;
            return undef;
        }
    }

    return start;
},

_setVisibleDescendantsCached : function (node, newAllCached, parent, recalc) {
    var undef;
    
    var allCachedProperty = this._visibleDescendantsCachedProperty,
        prevAllCached = node[allCachedProperty];

    if (newAllCached == null) {
        

        // UNLOADED, LOADING, and FOLDERS_LOADED LoadStates cause the allCachedProperty to be
        // false.
        var loadState = this.getLoadState(node);
        newAllCached = (
            loadState === isc.Tree.LOADED ||
            loadState === isc.Tree.LOADED_PARTIAL_CHILDREN);

        
        var children = this.getChildren(node, undef, undef, undef, undef, undef, true),
            childrenResultSet = isc.isA.ResultSet(children);

        if (newAllCached && (childrenResultSet || isc.isAn.Array(children))) {
            newAllCached = newAllCached && (
                (!childrenResultSet || (
                    children.allMatchingRowsCached() && children.lengthIsKnown())));

            for (var i = 0, length = children.getLength(); newAllCached && i < length; ++i) {
                var child = children.getCachedRow(i);
                newAllCached = (child != null && (
                    !this.isOpen(child) || child[allCachedProperty] || false));
            }
        }
    }

    
    node[allCachedProperty] = newAllCached;

    
    parent = parent || this.getParent(node);
    if ((recalc || !prevAllCached) && newAllCached) {
        
        if (parent != null && this.isOpen(node)) {
            var loadState = this.getLoadState(parent),
                children = this.getChildren(parent),
                childrenResultSet = isc.isA.ResultSet(children),
                allCached = (
                    (loadState === isc.Tree.LOADED ||
                        loadState === isc.Tree.LOADED_PARTIAL_CHILDREN) &&
                    (!childrenResultSet || (
                        children.allMatchingRowsCached() && children.lengthIsKnown())));

            if (allCached && (childrenResultSet || isc.isAn.Array(children))) {
                var index = children.indexOf(node);

                
                for (var i = children.getLength(); allCached && i-- > 0; ) {
                    if (i != index) {
                        var child = children.getCachedRow(i);
                        allCached = (child != null &&
                            (!this.isOpen(child) || child[allCachedProperty]));
                    }
                }
            }

            if (allCached) {
                this._setVisibleDescendantsCached(parent, true, null, false);
            } else {
                
            }
        }
    } else if ((recalc || prevAllCached) && !newAllCached) {
        
        while (parent != null && parent[allCachedProperty] && this.isOpen(node)) {
            parent[allCachedProperty] = false;
            node = parent;
            parent = this.getParent(parent);
        }
    }
},


__add : function (node, parent, position, linkRecord, path) {
    if (this.isPaged() && !this.keepParentsOnFilter) {
        var validRows = this.getDataSource().applyFilter([node], this.getCombinedCriteria(), this.context);
        if (validRows.length == 0) {
            return;
        }
    }
    return this.invokeSuper(isc.ResultTree, "__add", node, parent, position, linkRecord, path);
},


_preAdd : function (node, parent, position, removeCollisions, info) {
    var ret = this.invokeSuper(isc.ResultTree, "_preAdd", node, parent, position, removeCollisions, info);
    if (this.isPaged()) {
        var loadState = this.getLoadState(node),
            newAllCached = (
                loadState === isc.Tree.LOADED ||
                loadState === isc.Tree.LOADED_PARTIAL_CHILDREN);

        this._setVisibleDescendantsCached(node, newAllCached, parent, true);
    }
    return ret;
},


setRoot : function (newRoot, autoOpen) {
    if (this.isPaged()) {
        
        var newRootFromSameTree = (newRoot && isc.endsWith(this.parentProperty, this.ID));
        this._cleanResultSetChildren(newRootFromSameTree ? newRoot : this.getRoot(), true);
    }
    return this.invokeSuper(isc.ResultTree, "setRoot", newRoot, autoOpen);
},


_preRemove : function (node, parent, info) {
    if (this.isPaged()) {
        this._setVisibleDescendantsCached(node, true, parent, false);
        delete node[this._visibleDescendantsCachedProperty];
        this._cleanResultSetChildren(node, false);
    }
    return this.invokeSuper(isc.ResultTree, "_preRemove", node, parent, info);
},


unloadChildren : function (node, displayNodeType, markAsLoaded) {
    if (this.isPaged()) {
        this._cleanResultSetChildren(node, false);
    }
    return this.invokeSuper(isc.ResultTree, "unloadChildren", node, displayNodeType,
                            markAsLoaded);
},

_cleanResultSetChildren : function (node, cleanNonDescendants) {
    
    var resultSetChildren = this._resultSetChildren;
    for (var i = (resultSetChildren != null ? resultSetChildren.length : 0); i--; ) {
        var children = resultSetChildren[i],
            parentNode = children._parentNode;

        if (cleanNonDescendants ^ (parentNode == node || this.isDescendantOf(parentNode, node))) {
            
            resultSetChildren.removeAt(i);
            if (this.isObserving(children, "dataArrived")) {
                this.ignore(children, "dataArrived");
            }
            delete children._parentNode;
            delete children._tree;
            delete children.context.keepParentsOnFilter;
            children.setCriteria = isc.ResultSet.getInstanceProperty("setCriteria");
            // Clear the properties from _childrenResultSetProperties.
            delete children._dataAdd;
            delete children._dataAdded;
            delete children._dataRemove;
            delete children._dataRemoved;
            delete children._dataSplice;
            delete children._dataSpliced;
            delete children._dataMoved;
            delete children._dataLengthIsKnownChanged;
        }
    }
},


changeDataVisibility : function (node, newState, callback, path) {
//!DONTOBFUSCATE  (obfuscation breaks the inline function definitions)

    if (this.isPaged()) {
        

        var parent = this.getParent(node),
            state = this.isOpen(node),
            changed = (!this.isLeaf(node) && (state ^ newState)),
            closedToOpen = (changed && !state && newState),
            openToClosed = (changed && !closedToOpen),
            visibleCached = node[this._visibleDescendantsCachedProperty],
            parentVisibleCached = (
                parent != null && parent[this._visibleDescendantsCachedProperty]);

        
        var ret = this.invokeSuper(isc.ResultTree, "changeDataVisibility", node, newState, callback);
        if (parent != null && !visibleCached && (
            (closedToOpen && parentVisibleCached) || (openToClosed && !parentVisibleCached)))
        {
            this._setVisibleDescendantsCached(parent, null, null, false);
        }
        return ret;
    } else {
        return this.invokeSuper(isc.ResultTree, "changeDataVisibility", node, newState, callback, path);
    }
},

_childrenDataAdd : function (children, parent, addedChildren, addedLength, index, before) {
    var loadingMarker = isc.ResultSet.getLoadingMarker();
    

    
    var openSubfoldersAllowed = (
            parent[this.canReturnOpenSubfoldersProperty] != null ?
            parent[this.canReturnOpenSubfoldersProperty] : this.canReturnOpenFolders),
        defaultChildLength = (
            this.openDisplayNodeType == isc.Tree.FOLDERS_AND_LEAVES ? 1 : 0),
        knownLengthNulls = (
            // The conditions for null/LOADING nodes said to have length 1:
            !(openSubfoldersAllowed || defaultChildLength == 0) &&
            // Only add the 1s from null/LOADING nodes into the length once (so do this only
            // when `!before` is true) and only when the parent's length incorporates the
            // lengths of its children.
            !before &&
            this._includeNodeLengthInParent(null, parent));

    if (addedChildren == null || addedChildren == loadingMarker) {
        if (knownLengthNulls) {
            this._updateParentLengths(parent, addedLength);
        }
        return;
    }
    if (addedLength == 1 && !isc.isAn.Array(addedChildren)) {
        addedChildren = [addedChildren];
    }

    var parentStartRow = this._getStartRow(parent),
        undef;
    if (parentStartRow === undef) {
        
        return;
    }

    if (before) {
        parent[this._recursionCountProperty] = 1 + (parent[this._recursionCountProperty] || 0);
    }

    var infoStack = (this._infoStack = this._infoStack || []),
        collisionsStack = (this._collisionsStack = this._collisionsStack || []),
        collisions,
        grandChildrenStack = [],
        deltaParentLength = 0,
        grandParent,
        origParentLength;
    if (before) {
        collisions = [];
        collisionsStack.push(collisions);
    } else {
        collisions = collisionsStack.pop();
    }

    
    var i0 = (before ? 0 : addedLength - 1),
        iInc = (before ? 1 : -1);
    for (var i = i0; (before ? i < addedLength : i >= 0); i += iInc) {
        var addedChild = addedChildren[i];
        if (addedChild != null && addedChild != loadingMarker) {
            if (before) {
                var info = {};
                infoStack.push(info);
                var collision = this._findCollision(addedChild);
                if (collision) {
                    collisions.add(collision);
                }
                this._preAdd(addedChild, parent, index, false, info);
            } else {
                var info = infoStack.pop();
                this._postAdd(addedChild, parent, index, info);
                grandChildrenStack.push(info.grandChildren);

                
                deltaParentLength += info.deltaParentLength;
                grandParent = info.grandParent;
                origParentLength = info.origParentLength;
            }
        } else if (knownLengthNulls) {
            // The `knownLengthNulls` flag indicates that this null/LOADING is given length 1.
            ++parent[this._cachedLengthProperty];
        }
    }

    if (!before) {
        

        
        var fromParent = (parent[this.canReturnOpenSubfoldersProperty] != null),
            openSubfoldersNotAllowed = !openSubfoldersAllowed;

        for (var i = 0; i < addedLength; ++i) {
            var addedChild = addedChildren[i];

            if (addedChild != null && addedChild != loadingMarker) {
                var grandChildren = this._canonicalizeChildren(addedChild, grandChildrenStack.pop(), false);

                
                if (openSubfoldersNotAllowed &&
                    this.isOpen(addedChild) &&
                    grandChildren != null && !grandChildren.isEmpty())
                {
                    this.logWarn(
                        "Adding the open folder node '" + this.getPath(addedChild) + "' as " +
                        "a child of the parent node '" + this.getPath(parent) + "' is " +
                        "contradictory to the setting of the " + (fromParent ? "'" +
                        this.canReturnOpenSubfoldersProperty + "' property of the parent node." :
                        "'canReturnOpenFolders' property of the tree."));
                }

                if (grandChildren != null) {
                    if (isc.isA.ResultSet(grandChildren)) {
                        
                        if (!(grandChildren.lengthIsKnown() && grandChildren.allMatchingRowsCached())) {
                            this._setVisibleDescendantsCached(addedChild, false, parent, false);
                        }
                    } else if (!isc.isAn.Array(grandChildren)) {
                        this.__add(grandChildren, addedChild);
                    } else {
                        this.__addList(grandChildren, addedChild);
                    }
                }
            }
        }

        
        if ((--parent[this._recursionCountProperty]) == 0) {
            delete parent[this._recursionCountProperty];
            if (grandParent) {
                deltaParentLength += (this._getNodeLengthToParent(parent, grandParent) - origParentLength);
                this._updateParentLengths(grandParent, deltaParentLength);
            }
        }


        this._setVisibleDescendantsCached(parent, null, null, false);

        if (collisions.length > 0) {
            for (var i = collisions.length; i--; ) {
                var collision = collisions.pop();
                this._removeCollision(collision);
            }
        }

        this._clearNodeCache(true);
        this.dataChanged();
    }
},

_childrenDataRemove : function (children, parent, removedChildren, removedLength, index, before) {
    var loadingMarker = isc.ResultSet.getLoadingMarker();
    

    // Define conditions for when null/LOADING nodes are given length 1.
    var openSubfoldersAllowed = (
            parent[this.canReturnOpenSubfoldersProperty] != null ?
            parent[this.canReturnOpenSubfoldersProperty] : this.canReturnOpenFolders),
        defaultChildLength = (
            this.openDisplayNodeType == isc.Tree.FOLDERS_AND_LEAVES ? 1 : 0),
        knownLengthNulls = (
            !(openSubfoldersAllowed || defaultChildLength == 0) &&
            !before &&
            this._includeNodeLengthInParent(null, parent));

    if (removedChildren == null || removedChildren == loadingMarker) {
        if (knownLengthNulls) {
            this._updateParentLengths(parent, -removedLength);
        }
        return;
    }
    if (removedLength == 1 && !isc.isAn.Array(removedChildren)) {
        removedChildren = [removedChildren];
    }

    var parentStartRow = this._getStartRow(parent),
        undef;
    if (parentStartRow === undef) {
        return;
    }

    if (before) {
        parent[this._recursionCountProperty] = 1 + (parent[this._recursionCountProperty] || 0);
    }

    var infoStack = (this._infoStack = this._infoStack || []),
        grandParent,
        origParentLength;

    var i0 = (before ? 0 : removedLength - 1),
        iInc = (before ? 1 : -1);
    for (var i = i0; (before ? i < removedLength : i >= 0); i += iInc) {
        var removedChild = removedChildren[i];
        if (removedChild != null && removedChild != loadingMarker) {
            if (before) {
                var info = {};
                infoStack.push(info);
                this._preRemove(removedChild, parent, info);
            } else {
                var info = infoStack.pop();
                this._postRemove(removedChild, parent, info);
                grandParent = info.grandParent;
                origParentLength = info.origParentLength;
            }
        } else if (knownLengthNulls) {
            --parent[this._cachedLengthProperty];
        }
    }

    if (!before) {
        
        if ((--parent[this._recursionCountProperty]) == 0) {
            delete parent[this._recursionCountProperty];
            if (grandParent) {
                var deltaParentLength = (
                        this._getNodeLengthToParent(parent, grandParent) - origParentLength);
                this._updateParentLengths(grandParent, deltaParentLength);
            }
        }

        this._setVisibleDescendantsCached(parent, null, null, false);

        this._clearNodeCache(true);
        this.dataChanged();
    }
},

_childrenDataSplice : function (children, parent, removedChildren, removedLength, index, addedChildren, addedLength, before) {
    var loadingMarker = isc.ResultSet.getLoadingMarker();
    

    // Define conditions for when null/LOADING nodes are given length 1.
    var openSubfoldersAllowed = (
            parent[this.canReturnOpenSubfoldersProperty] != null ?
            parent[this.canReturnOpenSubfoldersProperty] : this.canReturnOpenFolders),
        defaultChildLength = (
            this.openDisplayNodeType == isc.Tree.FOLDERS_AND_LEAVES ? 1 : 0),
        knownLengthNulls = (
            !(openSubfoldersAllowed || defaultChildLength == 0) &&
            !before &&
            this._includeNodeLengthInParent(null, parent));

    var removedNodes = !(removedChildren == null || removedChildren == loadingMarker),
        addedNodes = !(addedChildren == null || addedChildren == loadingMarker);

    if (!(removedNodes || addedNodes)) {
        if (knownLengthNulls) {
            this._updateParentLengths(parent, addedLength - removedLength);
        }
        // There is nothing to do.
        return;
    } else if (!addedNodes) {
        if (knownLengthNulls) {
            this._updateParentLengths(parent, addedLength);
        }
        this._childrenDataRemove(children, parent, removedChildren, removedLength, index, before);
        return;
    } else if (!removedNodes) {
        if (knownLengthNulls) {
            this._updateParentLengths(parent, -removedLength);
        }
        this._childrenDataAdd(children, parent, addedChildren, addedLength, index, before);
        return;
    }

    

    var parentStartRow = this._getStartRow(parent),
        undef;
    if (parentStartRow === undef) {
        return;
    }

    if (before) {
        parent[this._recursionCountProperty] = 1 + (parent[this._recursionCountProperty] || 0);
    }

    var infoStack = (this._infoStack = this._infoStack || []),
        collisionsStack = (this._collisionsStack = this._collisionsStack || []),
        collisions,
        grandChildrenStack = [],
        deltaParentLength = 0,
        grandParent,
        origParentLength;
    if (before) {
        collisions = [];
        collisionsStack.push(collisions);
    } else {
        collisions = collisionsStack.pop();
    }

    // ensure addedChildren/removedChildren are arrays as assumed below
    
    if (addedLength == 1 && !isc.isAn.Array(addedChildren)) {
        addedChildren = [addedChildren];
    }
    if (removedLength == 1 && !isc.isAn.Array(removedChildren)) {
        removedChildren = [removedChildren];
    }

    var i0 = (before ? 0 : addedLength + removedLength - 1),
        iInc = (before ? 1 : -1);
    for (var i = i0; (before ? i < addedLength + removedLength : i >= 0); i += iInc) {
        
        var add = (removedLength <= i),
            child = (add ? addedChildren[i - removedLength] : removedChildren[i]);
        if (child != null && child != loadingMarker) {
            if (before) {
                var info = {};
                infoStack.push(info);
                if (add) {
                    var collision = this._findCollision(child);
                    if (collision && !(removedNodes && removedChildren.contains(collision))) {
                        collisions.add(collision);
                    }
                    this._preAdd(child, parent, index, false, info);
                } else {
                    this._preRemove(child, parent, info);
                }
            } else {
                var info = infoStack.pop();
                if (add) {
                    this._postAdd(child, parent, index, info);
                    grandChildrenStack.push(info.grandChildren);

                    
                    deltaParentLength += info.deltaParentLength;
                } else {
                    this._postRemove(child, parent, info);
                }
                grandParent = info.grandParent;
                origParentLength = info.origParentLength;
            }
        } else if (knownLengthNulls) {
            if (add) {
                ++parent[this._cachedLengthProperty];
            } else {
                --parent[this._cachedLengthProperty];
            }
        }
    }

    if (!before) {
        
        var fromParent = (parent[this.canReturnOpenSubfoldersProperty] != null),
            openSubfoldersNotAllowed = !openSubfoldersAllowed;

        for (var i = 0, j = 0; i < addedLength; ++i) {
            var addedChild = addedChildren[i];
            if (addedChild != null && addedChild != loadingMarker) {
                var grandChildren = this._canonicalizeChildren(addedChild, grandChildrenStack.pop(), false);

                
                if (openSubfoldersNotAllowed &&
                    this.isOpen(addedChild) &&
                    grandChildren != null && !grandChildren.isEmpty())
                {
                    this.logWarn(
                        "Adding the open folder node '" + this.getPath(addedChild) + "' as " +
                        "a child of the parent node '" + this.getPath(parent) + "' is " +
                        "contradictory to the setting of the " + (fromParent ? "'" +
                        this.canReturnOpenSubfoldersProperty + "' property of the parent node." :
                        "'canReturnOpenFolders' property of the tree."));
                }

                if (grandChildren != null) {
                    if (isc.isA.ResultSet(grandChildren)) {
                        if (!(grandChildren.lengthIsKnown() && grandChildren.allMatchingRowsCached())) {
                            this._setVisibleDescendantsCached(addedChild, false, parent, false);
                        }
                    } else if (!isc.isAn.Array(grandChildren)) {
                        this.__add(grandChildren, addedChild);
                    } else {
                        this.__addList(grandChildren, addedChild);
                    }
                }
            }
        }

        
        if ((--parent[this._recursionCountProperty]) == 0) {
            delete parent[this._recursionCountProperty];
            if (grandParent) {
                deltaParentLength += (this._getNodeLengthToParent(parent, grandParent) - origParentLength);
                this._updateParentLengths(grandParent, deltaParentLength);
            }
        }


        this._setVisibleDescendantsCached(parent, null, null, false);

        if (collisions.length > 0) {
            for (var i = collisions.length; i--; ) {
                var collision = collisions.pop();
                this._removeCollision(collision);
            }
        }

        this._clearNodeCache(true);
        this.dataChanged();
    }
},

_childrenDataMoved : function (children, parent, movedChildren, movedLength, oldIndex, newIndex) {
    var loadingMarker = isc.ResultSet.getLoadingMarker();
    
},


_childrenDataLengthIsKnownChanged : function (children, parent, oldValue, newValue) {
    var loadingMarker = isc.ResultSet.getLoadingMarker();
    

    
    this._setVisibleDescendantsCached(parent, null, null, false);

},


setDefaultLoadState : function (newDefaultLoadState) {
    var prevDefaultLoadState = this.defaultLoadState;
    this.defaultLoadState = newDefaultLoadState;

    if (this.isPaged() && (
            prevDefaultLoadState !== newDefaultLoadState ||
            (prevDefaultLoadState == null) ^ (newDefaultLoadState == null)))
    {
        var prevFlag = (
                prevDefaultLoadState === isc.Tree.LOADED ||
                prevDefaultLoadState === isc.Tree.LOADED_PARTIAL_CHILDREN),
            newFlag = (
                newDefaultLoadState === isc.Tree.LOADED ||
                newDefaultLoadState === isc.Tree.LOADED_PARTIAL_CHILDREN);

        if (prevFlag ^ newFlag) {
            
            var root = this.getRoot(),
                nodesWithDefaultLoadState = this.findAll("_loadState", null);
            
            if (root._loadState == null) {
                if (nodesWithDefaultLoadState == null) {
                    nodesWithDefaultLoadState = [root];
                } else {
                    nodesWithDefaultLoadState.add(root);
                }
            }

            if (nodesWithDefaultLoadState != null) {
                for (var i = nodesWithDefaultLoadState.length; i--; ) {
                    var node = nodesWithDefaultLoadState[i],
                        parent = this.getParent(node);
                    this._setVisibleDescendantsCached(node, null, parent, true);
                }
            }
        }
    }
},


// Criteria / Filtering
// --------------------------------------------------------------------------------------------

//> @method resultTree.setCriteria()
// Set the filter criteria to use when fetching rows.
// <P>
// Depending on the result of +link{compareCriteria()} and setting for
// +link{resultTree.fetchMode}, setting criteria may cause a trip to the server to get a new
// set of nodes, or may simply cause already-fetched nodes to be re-filtered according to the
// new criteria.
// <P>
// For a basic overview on when server fetches are generally performed, see
// +link{resultTree.fetchMode}.
// However, this is not the final determination of when server fetches occur. Criteria can
// be split into local criteria and server criteria by specifying +link{serverFilterFields}.
// Thus, even when using fetchMode:"local" a new server fetch will occur if the server
// criteria changes. For details on how the criteria is split, see
// +link{dataSource.splitCriteria}.
// <P>
// Note: if criteria is being split to retrieve server criteria portion and the criteria
// is an +link{AdvancedCriteria}, the criteria must consist of a single "and" operator
// and one or more simple criteria below it. No other logical operators may be used. In
// other words, the +link{AdvancedCriteria} provided must be exactly representable by a
// simple criteria.
//
// @param newCriteria (Criteria) the filter criteria
// @visibility external
//<

// An overview on tree caching:
// We have 2 kinds of cache
// - the cache of results that matches the current criteria: this.data
// - the cache of the full tree received from the server: this.completeTree
//   * When in local filtering mode both caches are populated. New records from the
//     server always go to completeTree and then the visible tree is filtered from
//     that. Local filtering mode only occurs in fetchMode:"local" with a client-side
//     criteria. Note that if server criteria changes the completeTree cache is
//     overwritten with data from the server and the local cache rebuilt from client-side
//     criteria.
//   * When in basic filtering mode, we only populate the local cache: this.data.
//     On the first fetch we fill this local cache with the results returned from the server.
//     On subsequent changes to filter criteria, we will perform a new server fetch
//     and update the local cache.
setCriteria : function (newCriteria, checkFilterChanged) {

    var oldCriteria = this.criteria || {},
        // If this._localCriteria is null, we have no serverFilterFields
        // in this case any oldCriteria are local criteria
        oldLocalCriteria = this._localCriteria || oldCriteria,
        oldServerCriteria = this._serverCriteria || {},
        ds = this.getDataSource(),
        filterChanged
    ;

    // if requested, store whether filter criteria have changed in return value
    if (checkFilterChanged) filterChanged = this._willFetchData(newCriteria, true);

    // cache the current textMatchStyle as we do in resultSet.setCriteria()
    this._textMatchStyle = this.context && this.context.textMatchStyle || null;

    // clone the criteria passed in - avoids potential issues where a criteria object is passed in
    // and then modified outside the RS
    // Avoid this with advanced criteria - our filter builder already clones the output
    if (!ds.isAdvancedCriteria(newCriteria)) {
        // use clone to deep copy so we duplicate dates, arrays etc
        newCriteria = isc.clone(newCriteria);
    }   

    // If one of the criteria objects is an AdvancedCriteria, convert the other one to 
    // enable comparison
    if (ds.isAdvancedCriteria(newCriteria) && !ds.isAdvancedCriteria(oldCriteria)) {
        oldCriteria = isc.DataSource.convertCriteria(oldCriteria);
    }
    if (!ds.isAdvancedCriteria(newCriteria) && ds.isAdvancedCriteria(oldCriteria)) {
        newCriteria = isc.DataSource.convertCriteria(newCriteria);
    }

    // oldCombinedCriteria: Combination of implicit and explicit criteria
    // currently applied to this tree
    
    var oldCombinedCriteria = this._combinedCriteria || oldCriteria;
    var newCombinedCriteria = this._getCombinedCriteria(newCriteria);


    this.criteria = newCriteria;
    // Hang onto the combined criteria object - this represents what is currently
    // applied to the data
    this._combinedCriteria = newCombinedCriteria;

    // serverFilterFields is only applicable for fetchMode:"local" ResultTrees.
    if (this.isLocal() &&
        this.serverFilterFields != null &&
        this.serverFilterFields.length > 0)
    {
        this._localCriteria = isc.DataSource.copyCriteria(newCombinedCriteria);
        this._serverCriteria = ds.splitCriteria(this._localCriteria, this.serverFilterFields, true);

    } else {
        delete this._localCriteria;
        delete this._serverCriteria;
    }

    // See if the criteria changed
    var result = this.compareCriteria(newCombinedCriteria, oldCombinedCriteria);
    if (result != 0) {
        // Criteria changed

        if (!this.isLocal()) {
            // Not using client-side filtering, just invalidateCache
            //>DEBUG
            this.logInfo("setCriteria: filter criteria changed, invalidating cache");
            //<DEBUG

            this.invalidateCache();

            // Update the criteria on any ResultSet children.
            if (this.isPaged() && this._resultSetChildren != null) {
                var resultSetChildren = this._resultSetChildren.duplicate();
                var combinedCrit = this.getCombinedCriteria();
                for (var i = resultSetChildren.length; i--; ) {
                    var children = resultSetChildren[i];
                    if (this._resultSetChildren.contains(children)) {
                        var node = children._parentNode,
                            relationship = this._getRelationship(node, false),
                            childrenCriteria = this._getLoadChildrenCriteria(
                                node, relationship, false);

                        children.setCriteria(
                            isc.DataSource.combineCriteria(childrenCriteria, combinedCrit));
                    }
                }
            }
        } else {
            // Filtering locally but the server part of criteria may have changed.
            // If so, we have to invalidate our cache to get a new tree.
            if (this.haveCriteria(this._serverCriteria) ?
                    (this.compareCriteria(this._serverCriteria, oldServerCriteria) != 0) :
                    this.haveCriteria(oldServerCriteria))
            {
                //>DEBUG
                this.logInfo("setCriteria: server filter criteria changed, invalidating cache");
                //<DEBUG
                this.invalidateCache();
            } else {
                // No server criteria change
                var openState = this._getOpenState();
                var canFilterLocally = true;

                // Make sure we have a complete tree saved if we are starting to filter locally
                // [if _localCriteria is null we have no _serverCriteria so all criteria are local]
                var newLocalCriteria = this._localCriteria || this.getCombinedCriteria();
                if (this.haveCriteria(newLocalCriteria) && this.completeTree == null) {
                    // If we currently have criteria we can't clone ourselves as the new
                    // completeTree or we won't be filtering from a full data set.
                    
                    if (this.haveCriteria(oldLocalCriteria)) {
                        //>DEBUG
                        this.logWarn("setCriteria: unable to filter current data locally - invalidating cache");
                        //<DEBUG
                        canFilterLocally = false;
                    } else {
                        this.completeTree = this.duplicate(true, true, true);
                    }
                }
                if (canFilterLocally) {
                    this.filterLocalData();
                    // Local filter of existing client side data. No need to check for
                    // server-specified open-state.
                    // NOTE: filterLocalData() has relinked the tree, so the nodes are now different 
                    // objects than the nodes we stored in the openState variable.  For multiLink
                    // trees, this is significant because it means that node lookups in the index
                    // will fail.  So refresh the cached openState from the current nodeIndex
                    if (this.isMultiLinkTree()) {
                        for (var i = 0; i < openState.length; i++) {
                            openState[i].node = this._getNodeFromIndex(openState[i].node);
                        }
                    }
                    this._setOpenState(openState);

                    if (this.dataArrived != null) {
                        this.dataArrived(this.getRoot());
                    }
                } else {
                    this.invalidateCache();
                }
            }
        }
    }

    return filterChanged;
},

//> @attr resultTree.criteria (Criteria : null : IRW)
// The filter criteria to use when fetching rows.  For usage see
// +link{resultTree.setCriteria()}.
//
// @visibility external
//<

filterLocalData : function (parentNode) {
    
    
    if (!parentNode) parentNode = this.getRoot(); 
    var criteria = this._localCriteria || this.getCombinedCriteria(),
        sourceTree = this.completeTree;

    if (this.haveCriteria(criteria)) {
                
        

        // Filter tree
        var filterMode = (this.keepParentsOnFilter ? isc.Tree.KEEP_PARENTS : isc.Tree.STRICT),
            dataSource = this.getDataSource();

        sourceTree = this.applyFilter(this.completeTree, criteria, filterMode,
                                      dataSource, this.context);
        //>DEBUG
        this.logInfo("Local filter applied: " + sourceTree.getNodeList().length
                     + " of " + this.completeTree.getNodeList().length
                     + " records matched filter:" + this.echoFull(criteria));
        //<DEBUG
    } else {
        
        if (!sourceTree) return;
        // No criteria anymore. Drop the complete tree as there is no need
        // to keep it updated.
        //>DEBUG
        this.logInfo("Local filter applied: " + sourceTree.getNodeList().length
                     + " records matched filter: none");
        //<DEBUG
        delete this.completeTree;
    }

    // Remove our existing tree structure (this.data),
    // and instead copy the source tree (filtered or full) into this.data
    // no need to explicitly run _linkNodes() - this will occur as part of
    // setRoot().
    var nodes = sourceTree.getAllNodes();
    this.data = sourceTree.getCleanNodeData(nodes, false, false, true);
    this.setRoot(this.getCleanNodeData(this.getRoot(), false, false, true));

     

    // fetchMode is "local" - mark root as loaded
    
    this.setLoadState(this.getRoot(), isc.Tree.LOADED);

   // destroy() tree to detach observers for applyFilter() case
    if (this.completeTree != null) sourceTree.destroy();

    this._clearNodeCache(true);
},

//> @method resultTree.applyFilter() [A]
// The ResultTree will call applyFilter() when it needs to locally filter the tree using the
// current filter criteria.
// <P>
// Default behavior is to call +link{tree.getFilteredTree()} to obtain a new, filtered tree.
// <P>
// Override this method or +link{tree.getFilteredTree()} to implement your own client-side
// filtering behavior. Note that the original tree should not be affected.
//
// @param   tree        (Tree)           the source tree to be filtered
// @param   criteria    (Criteria)       the filter criteria
// @param   filterMode  (TreeFilterMode) mode to use for filtering
// @param   dataSource  (DataSource)     dataSource for filtering if the Tree does not
//                                       already have one
// @param [requestProperties] (DSRequest) Request properties block. This allows developers to specify
//  properties that would impact the filter such as +link{DSRequest.textMatchStyle}
// @return  (Tree)     the filtered tree (copy)
// @visibility external
//<
applyFilter : function (tree, criteria, filterMode, dataSource, context) {
    return tree.getFilteredTree(criteria, filterMode, dataSource, context);
},

//> @method resultTree.compareCriteria()
// Default behavior is to call +link{dataSource.compareCriteria()} to determine whether new
// criteria is equivalent to the old criteria (returns 0) or not.
// <P>
// See +link{dataSource.compareCriteria()} for a full explanation of the default behavior.
// The +link{criteriaPolicy} used is "dropOnChange".
// <P>
// Override this method or +link{dataSource.compareCriteria()} to implement your own client-side
// filtering behavior.
//
// @param   newCriteria     (Criteria)  new filter criteria
// @param   oldCriteria     (Criteria)  old filter criteria
// @param   [requestProperties]     (DSRequest Properties)  dataSource request properties
// @return  (Number)    0 if the criteria are equivalent, -1 if the criteria are different
// @see criteriaPolicy
// @visibility external
//<
compareCriteria : function (newCriteria, oldCriteria, requestProperties, policy) {
    return this.getDataSource().compareCriteria(
                newCriteria, oldCriteria,
                (requestProperties ? requestProperties : this.context),
                (policy ? policy : "dropOnChange"));
},

//> @method resultTree.willFetchData()
// Will changing the criteria for this resultTree require fetching new data from the server
// or can the new criteria be satisfied from data already cached on the client?
// <p>
// This method can be used to determine whether +link{TreeGrid.fetchData()} or 
// +link{TreeGrid.filterData()} will cause a server side fetch when passed a certain set of 
// criteria.
//
// @param newCriteria (Criteria) new criteria to test.
// @return (Boolean) true if server fetch would be required to satisfy new criteria.
// @visibility external
//<
willFetchData : function (newCriteria) {
    return this._willFetchData(newCriteria) == true;
},


_willFetchData : function (newCriteria, checkTextMatchStyle) {
    var undef;
    var oldCriteria = this.criteria || {},
        oldServerCriteria = this._serverCriteria || {},
        ds = this.getDataSource()
    ;

    // clone the criteria passed in - avoids potential issues where a criteria object is passed in
    // and then modified outside the RS
    // Avoid this with advanced criteria - our filter builder already clones the output
    if (!ds.isAdvancedCriteria(newCriteria)) {
        newCriteria = isc.DataSource.copyCriteria(newCriteria);
    }
        
    // If one of the criteria objects is an AdvancedCriteria, convert the other one to 
    // enable comparison
    if (ds.isAdvancedCriteria(newCriteria) && !ds.isAdvancedCriteria(oldCriteria)) {
        oldCriteria = isc.DataSource.convertCriteria(oldCriteria);
    }
    if (!ds.isAdvancedCriteria(newCriteria) && ds.isAdvancedCriteria(oldCriteria)) {
        newCriteria = isc.DataSource.convertCriteria(newCriteria);
    }

    var dsTextMatchStyle = ds.defaultTextMatchStyle,
        oldTextMatchStyle = this._textMatchStyle || dsTextMatchStyle,
        newTextMatchStyle = (this.context && this.context.textMatchStyle) || oldTextMatchStyle
    ;

    if (this.lastImplicitCriteria) {
        // combine oldCriteria with the lastImplicitCriteria - needed when 
        // DBC.setImplicitCriteria() / RS.setDbcImplicitCriteria() is passed null 
        oldCriteria = isc.DS.compressNestedCriteria(
            ds.combineCriteria(oldCriteria, this.lastImplicitCriteria, null, oldTextMatchStyle)
        );
    }

    var iCrit = this.getImplicitCriteria();
    if (iCrit) {
        // combine newCriteria with the current dbcImplicitCriteria
        newCriteria = isc.DS.compressNestedCriteria(
            ds.combineCriteria(newCriteria, iCrit, null, newTextMatchStyle)
        );
    }

    
    var result = 0;
    if (checkTextMatchStyle && !isc.isAn.emptyObject(oldCriteria)) {
        result = ds.compareTextMatchStyle(newTextMatchStyle, oldTextMatchStyle);
    }

    var hasImplicitCrit = (this.dbcImplicitCriteria || this.lastImplicitCriteria)
    if (result == 0 || hasImplicitCrit) result = this.compareCriteria(newCriteria, oldCriteria);

    // If we have no change in criteria we won't perform a fetch
    if (result == 0) return null;

    // If we are not filtering locally a fetch is required
    
    if (!this.isLocal()) return true;

    // Criteria has changed but we need to see if it affects the fetches. That is the
    // case only if the server criteria portion has changed.

    // Split our criteria to obtain the new server criteria
    var newServerCriteria = {};
    if (this.isLocal() &&
        this.serverFilterFields != null &&
        this.serverFilterFields.length > 0)
    {
        var localCriteria = isc.DataSource.copyCriteria(newCriteria);
        newServerCriteria = ds.splitCriteria(localCriteria, this.serverFilterFields, true);
    }

    // If server criteria changed, a fetch is required
    return (this.haveCriteria(newServerCriteria) ?
                (this.compareCriteria(newServerCriteria, oldServerCriteria) != 0) :
                this.haveCriteria(oldServerCriteria));
},
    
// View state
// --------------------------------------------------------------------------------------------

 
//> @method resultTree.getOpenState() 
// Returns a snapshot of the current open state of this tree's data as
// a +link{type:TreeGridOpenState} object.
// <P>
// This object can be passed to +link{resultTree.setOpenState()} or
// +link{treeGrid.setOpenState()} to open the same set of folders
// within the tree's data (assuming the nodes are still present in the data).
// @return (TreeGridOpenState) current open state for the grid.
// @group viewState
// @see resultTree.setOpenState()
// @visibility external
//<
getOpenState : function() {
    var openState = this._getOpenState();
    return isc.Comm.serialize(openState);
},  

_getOpenState : function(isCacheRestore) {

    var root = this.getRoot(),
        openState = []
    ;
    this._addNodeToOpenState(this, root, openState, isCacheRestore);
    
    return openState;
},

//> @method resultTree.setOpenState() 
// Reset the set of open folders within this tree's data to match the 
// +link{type:TreeGridOpenState} object passed in.
// <P>
// Used to restore previous state retrieved from the tree by a call to 
// +link{resultTree.getOpenState()}.
//
// @param openState (TreeGridOpenState) Object describing the desired set of open folders.
// @group viewState
// @see resultTree.getOpenState()
// @visibility external
//<
setOpenState : function(openState) {
    openState = isc.Canvas.evalViewState(openState, "openState", false, this)
    if (!openState) return;
    if (this.isMultiLinkTree()) {
        // The nodeLocators in the openState have been serialized and then recreated, so the 
        // "node" members are not the same objects as the nodes in the nodeIndex.  This would
        // cause all sorts of problems downstream, so reset them by ID
        this._assignLocalNodesToNodeLocators(openState);
    }
    this._setOpenState(openState);
},

_assignLocalNodesToNodeLocators : function(locators) {
    for (var i = 0; i < locators.length; i++) {
        locators[i].node = this._getNodeFromIndex(locators[i].node);
    }
},

_setOpenState : function(openState, retainServerState) {
    if (!openState) return;
    if (!retainServerState) {
        this.closeAll();
    }
    this.openFolders(openState);
},


_addNodeToOpenState : function (tree, node, openState, isCacheRestore) {
    if (tree.isMultiLinkTree()) {
        //>DEBUG
        this._assert(node == tree.root);
        //<DEBUG
        var nodeLocator = tree.createNodeLocator(node, null, null, this.pathDelim);
        return this._addNodeToMultiLinkOpenState(tree, nodeLocator, openState, isCacheRestore);
    }
    if (!tree.isOpen(node) || !tree.isLoaded(node)) return false;
    if (isCacheRestore) {
        // explicit call to getName() will set up the "autoAssignedName" flag if this
        // method has never been called before
        tree.getName(node);
        if (this.autoPreserveOpenState == "never" || 
            (this.autoPreserveOpenState == "whenUnique" &&  node._autoAssignedName)) 
        {
//             this.logWarn("addNodeToOpenState: Skipping node::" + this.echo(node) + 
//                 " autoPreserveOpenState:" + this.autoPreserveOpenState);
             return false;
        }
    }

    var children = tree.getFolders(node),
        hasOpenChildren = false;
    if (children != null) {
        for (var i = 0; i < children.length; i++) {
            hasOpenChildren = this._addNodeToOpenState(tree, children[i], openState, isCacheRestore) 
                              || hasOpenChildren;
        }
    }
    openState[openState.length] = tree.getPath(node);
    return true;
},

_addNodeToMultiLinkOpenState : function(tree, nodeLocator, openState, isCacheRestore, path) {

    var node = nodeLocator.node;
    if (!tree.isOpen(nodeLocator) || !tree.isLoaded(node)) return false;
    if (isCacheRestore) {
        // explicit call to getName() will set up the "autoAssignedName" flag if this
        // method has never been called before
        tree.getName(node);
        if (this.autoPreserveOpenState == "never" || 
            (this.autoPreserveOpenState == "whenUnique" &&  node._autoAssignedName)) 
        {
            return false;
        }
    }

    var children = tree.getFolders(node),
        hasOpenChildren = false;
    if (children != null) {
        for (var i = 0; i < children.length; i++) {
            var childNodeLocator = this.createNodeLocator(
                children[i], 
                node[this.idField],
                i,
                this._constructChildPath(nodeLocator.path, children[i])
            );
            hasOpenChildren = this._addNodeToMultiLinkOpenState(tree, childNodeLocator, openState, isCacheRestore) 
                              || hasOpenChildren;
        }
    }
    openState[openState.length] = nodeLocator;
    return true;
}

});

// isc._dataModelToString and isc._dataModelLogMessage are defined in Log.js
isc.ResultTree.getPrototype().toString = isc._dataModelToString;
isc.ResultTree.getPrototype().logMessage = isc._dataModelLogMessage;

isc.ResultTree.registerStringMethods({
    
    //> @method resultTree.dataArrived
    // This callback fires whenever the resultTree receives new nodes from the server, after
    // the new nodes have been integrated into the tree.
    // 
    // @param parentNode (TreeNode) The parentNode for which children were just loaded
    //
    // @visibility external
    //<
    dataArrived: "parentNode"
});


