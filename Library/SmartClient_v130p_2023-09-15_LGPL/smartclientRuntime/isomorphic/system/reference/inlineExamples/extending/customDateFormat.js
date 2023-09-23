// Custom date format function
function dateFormatFunction () {
    return this.getDate() + "." + (this.getMonth() + 1) + "." + this.getShortYear();
}; 

// Custom date formatting and input format may be defined globally or at the
// component level.
//  - uncomment the following 2 lines to apply to all components:
//Date.setShortDisplayFormat(dateFormatFunction);
//Date.setInputFormat("DMY");


isc.ListGrid.create({
    ID:"employeeGrid",
    width:250, height:100,
    canEdit:true,
    dataSource:"employees",
    autoFetchData:true,
    recordClick:"employeeForm.editRecord(record)",
    // Specify date formatting and input format for
    // this component
    //  - If not explicitly set, standard formattaing behaviour would
    //    be determined by Date.shortDateDisplayFormat and Date.inputFormat 
    dateFormatter:dateFormatFunction,
    dateInputFormat:"DMY"
});

isc.DynamicForm.create({
    ID:"employeeForm",
    top:150,
    dataSource:"employees",
    fields:[
        {name:"name"},
        {name:"hireDate", useTextField:true, wrapTitle:false, 
            // Specify date formatting and input format for
            // this item
            //  - If not explicitly set, standard formattaing behaviour would
            //    be determined by Date.shortDateDisplayFormat and Date.inputFormat 
            inputFormat:"DMY", displayFormat:dateFormatFunction
        },
        {type:"button", title:"Save Edits", click:"form.saveData()"}
    ]
    
});
