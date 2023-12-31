isc.DynamicForm.create({
    ID: "contactForm",
    width: 400,
    wrapHintText: false,
    wrapItemTitles: false,
    fields: [
        { name: "firstName", title: "First name", editorType: "TextItem",
          mask: ">?<??????????????", hint: "<nobr>&gt;?&lt;??????????????</nobr>"},
        { name: "lastName", title: "Last name", editorType: "TextItem",
          mask: ">?<??????????????", hint: "<nobr>&gt;?&lt;??????????????</nobr>"},
        { name: "state", title: "State", editorType: "TextItem",
          mask: ">LL", hint: "<nobr>&gt;LL</nobr>"},
        { name: "phoneNo", title: "Phone No.", editorType: "TextItem",
          mask: "(###) ###-####", hint: "(###) ###-####", showHintInField: true},
        { name: "dateItem", title: "Date", editorType: "DateItem",
          useTextField: true, useMask: true},
        { name: "dateTimeItem", title: "Date Time", editorType: "DateTimeItem",
          useTextField: true, useMask: true},
        { name: "timeItem", title: "Time", editorType: "TimeItem",
          useMask: true},
        { name: "color", title: "HTML Color", editorType: "TextItem", useMask: true,
          mask: "\\#>[0-9A-F][0-9A-F][0-9A-F][0-9A-F][0-9A-F][0-9A-F]", hint: "<nobr>\\\\#&lt;[0-9A-F][0-9A-F][0-9A-F][0-9A-F][0-9A-F][0-9A-F]</nobr>"},
    ]
});
