kendoBasicFilter ver: 1.0.4
----------

An alternate filter control for Kendo Grids if you don't want to use the default Kendo Filter controls;

See full working jsfiddle Demo: [HERE](http://jsfiddle.net/fictus/35eob1f6/)

How to Use
----------
After you initiate your kendoGrid then apply kendoBasicFilter like this:

```
#!javascript
    $("#tblData").kendoBasicFilter({
        filterBoxOptions: {
            filterBoxStyle: {
                "border": "1px solid #4D4D4D",
                "padding": "4px;",
                "background-color": "#4F4F4F",
                "color": "white"
            },
            serverFiltering: true,
			// filterIconClass: "fa fa-filter", 		-- assing a custom icon class here (if you need to use a different icon then the default)
            masterFilterText: function () {
                // if we need to do an "OR" master search alongside our filters, we can pass the filterText here;

                return $("#txtMasterSearch").val();
            },
            filterChanged: function (e) {
                // if needed, we can capture all the current state of all the filter objects
                // to do something meaningfull with them or to call other functions after filtering

                $.each(e, function (key, filterValue) {
                    if (key == "filterBoxOptions") {
                        return;
                    }
                    
                    // e[key].dataType      -- contains the "dataType"
                    // e[key].filterText    -- contains the filter (text or array)
                    // e[key].logicValue    -- if we are using the "numberOperator" then we can see what logic has been assigned
                });

                // I want to set my pager to page 1 after filtering
                $("#tblData").data("kendoGrid").dataSource.query({ page: 1, pageSize: 50 });
            }
        },
        // the objects below must match the "field" names you specified on your kendoGrid
        Year: {
            filterText: "",
            dataType: "number"
        },
        SerialNumber: {
            filterText: "",
            dataType: "string"
        },
        Name: {
            filterText: "",
            dataType: "string"
        },
        AskingPrice: {
            filterText: "",
            dataType: "numberOperator",
            logicValue: "",
            labelTemplate: function (data, title) {
                // filerLabels can be customized here

                return "<label>Column " + title + ":</label> the filter is " + data.logicValue + " " + data.filterText;
            }
        },
        InventoryAge: {
            filterText: "",
            dataType: "numberOperator",
            logicValue: ""
        },
        InventoryStatus: {
            filterText: [],
            dataType: "multiSelect",
            multiSelectOption: ["Repaired", "Missing", "Broken"]
        },
        Location: {
            filterText: "",
            dataType: "string"
        },
        Hours: {
            filterText: "",
            dataType: "numberOperator",
            logicValue: ""
        },
        ReservationText: {
            filterText: [],
            dataType: "multiSelect",
            multiSelectOption: ["Yes", "No"]
        },
        ReservationDate: {
            filterText: "",
            dataType: "date",
            dateFormat: "MM/DD/YYYY" // see moment.js date formats for more options
        }
    });
```
	
    
You can also manually refresh the filters by calling this method:
```
#!javascript
        $("#tblData").data("kendoBasicFilter").filterBoxOptions.triggerFilter($("#tblData")[0]);
```