/*
    kendoBasicFilter ver: 1.0.4


    How to Use
    ----------
    After you initiate your kendoGrid then apply kendoBasicFilter like this:

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

    
    You can also manually refresh the filters by calling this method:
        $("#tblData").data("kendoBasicFilter").filterBoxOptions.triggerFilter($("#tblData")[0]);

*/

(function ($) {
    $.fn.kendoBasicFilter = function (options) {
        if ($(this).data("kendobasicfilterInitialized")) {
            return;
        }

        var gridFilter = {
            filterBoxOptions: {
                filterBoxStyle: {
                    "border": "1px solid #4D4D4D",
                    "padding": "4px;",
                    "background-color": "#767676",
                    "color": "white"
                },
                serverFiltering: false,
                filterChanged: function (e) {

                }
            }
        };

        var defaultFilterOptions = $.extend(gridFilter, options);
        defaultFilterOptions.filterBoxOptions.triggerFilter = function (callerObject) {
            var currentFilterOptions = $(callerObject).data("kendoBasicFilter");
            kendoBasicFilterApplyFilter(currentFilterOptions, $(callerObject).find("table").find("tr").first().find("th").first());
        };

        $(this).find("thead").find("tr").first().find("th").each(function () {
            var filterBtnField = $(this).attr("data-field");

            if (filterBtnField in defaultFilterOptions) {
                var iconClass = ("filterIconClass" in defaultFilterOptions.filterBoxOptions ? defaultFilterOptions.filterBoxOptions.filterIconClass : "k-icon k-filter");
                $(this).find(".lnk-kendobasicfilter-current-col-data").remove();
                $(this).append("<a class='lnk-kendobasicfilter-current-col-data' href='#'><i></i></a>");
                $(this).find("a.lnk-kendobasicfilter-current-col-data i").addClass(iconClass);
                $(this).addClass("kendobasicfilter-column");
            }
        });

        $(this).data("kendoBasicFilter", defaultFilterOptions);
        $(this).data("kendobasicfilterInitialized", true);

        if (!$("body").find("#kendoBasicFilterSearchBox")[0]) {
            var kfltrSearchDiv = $("<div id='kendoBasicFilterSearchBox' style='position:absolute;display:none;' />");
            $(kfltrSearchDiv).css({
                "border": defaultFilterOptions.filterBoxOptions.filterBoxStyle["border"],
                "padding": defaultFilterOptions.filterBoxOptions.filterBoxStyle["padding"],
                "background-color": defaultFilterOptions.filterBoxOptions.filterBoxStyle["background-color"],
                "color": defaultFilterOptions.filterBoxOptions.filterBoxStyle["color"]
            });

            $(kfltrSearchDiv).append("<div><span class='kendobasicfilter-title-lbl'>filter:</span></div>");
            $(kfltrSearchDiv).append("<div class='kendobasicfilter-dv-string kendobasicfilter-dv-group'><input type='text' class='kendobasicfilter-filter-txt-string k-textbox' /></div>");
            $(kfltrSearchDiv).append("<div class='kendobasicfilter-dv-numberOperator kendobasicfilter-dv-group'>" +
                "<label>is: </label><select class='kendobasicfilter-filter-cmb-numberOperator k-dropdown k-state-default k-input' style='width:50px;min-width:50px;color:#ad8b28;margin-right:15px;'><option value='='>=</option><option value='>'>&gt;</option><option value='<'>&lt;</option></select>" +
                "<input type='number' class='kendobasicfilter-filter-txt-numberOperator k-textbox' style='width:100px;' /></div>");
            $(kfltrSearchDiv).append("<div class='kendobasicfilter-dv-multiSelect kendobasicfilter-dv-group'>" +
                "<select class='kendobasicfilter-filter-cmb-multiSelect k-input' style='color:black;width:100%;' multiple></select></div>");
            $(kfltrSearchDiv).append("<div><button class='kendobasicfilter-filter-btn-clear kendobasicfilter-filter-btn-group btn'>Clear</button><button class='kendobasicfilter-filter-btn-filter kendobasicfilter-filter-btn-group btn'>Filter</button></div>");

            $("body").append(kfltrSearchDiv);

            $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-txt-string").off("keydown");
            $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-txt-string").on("keydown", function (e) {
                var code = e.which;
                if (code == 13) {
                    e.preventDefault();

                    $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-btn-filter").trigger("click");

                    return false;
                }
            });
            $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-txt-numberOperator").off("keydown");
            $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-txt-numberOperator").on("keydown", function (e) {
                var code = e.which;
                if (code == 13) {
                    e.preventDefault();

                    $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-btn-filter").trigger("click");

                    return false;
                }
            });
            $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-cmb-numberOperator").off("change");
            $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-cmb-numberOperator").on("change", function (e) {
                $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-txt-numberOperator")[0].focus();
            });

            $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-btn-clear").off("click");
            $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-btn-clear").on("click", function () {
                var currentFilterOptions = $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-btn-filter").data("kendoBasicFilter");
                var currentFilterData = $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-btn-filter").attr("data-field");
                var currentFilterTitle = $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-btn-filter").attr("data-title");

                var currentCallerObject = $("#kendoBasicFilterSearchBox").data("callerObject");
                var currentFilterLabels = $("body").find(currentCallerObject).closest("table").find("thead").find("tr.kendo-basicfilter-filter-row").find(".kendo-basicfilter-filter-options");
                $(currentFilterLabels).find("span[data-field='" + currentFilterData + "']").remove();

                if (currentFilterLabels.find("span").length) {
                    currentFilterLabels.parent().css("display", "");
                } else {
                    currentFilterLabels.parent().css("display", "none");
                }

                if (currentFilterOptions[currentFilterData].dataType == "numberOperator") {
                    currentFilterOptions[currentFilterData].logicValue = "";
                }
                if (currentFilterOptions[currentFilterData].dataType == "multiSelect") {
                    currentFilterOptions[currentFilterData].filterText = [];
                } else {
                    currentFilterOptions[currentFilterData].filterText = "";
                }

                kendoBasicFilterApplyFilter(currentFilterOptions, currentCallerObject);

                $("body").find(currentCallerObject).closest("table").parent().data("kendoBasicFilter", currentFilterOptions);

                $("#kendoBasicFilterSearchBox").css("display", "none");

                if ("filterChanged" in currentFilterOptions.filterBoxOptions) {
                    currentFilterOptions.filterBoxOptions.filterChanged(currentFilterOptions);
                }

                return false;
            });

            $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-btn-filter").off("click");
            $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-btn-filter").on("click", function () {
                var currentFilterOptions = $(this).data("kendoBasicFilter");
                var currentFilterData = $(this).attr("data-field");
                var currentFilterTitle = $(this).attr("data-title");

                if (currentFilterOptions[currentFilterData].dataType == "string") {
                    currentFilterOptions[currentFilterData].filterText = $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-txt-string").val();
                } else if (currentFilterOptions[currentFilterData].dataType == "number") {
                    currentFilterOptions[currentFilterData].filterText = $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-txt-string").val();
                } else if (currentFilterOptions[currentFilterData].dataType == "date") {
                    currentFilterOptions[currentFilterData].filterText = $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-txt-string").val();
                } else if (currentFilterOptions[currentFilterData].dataType == "numberOperator") {
                    currentFilterOptions[currentFilterData].filterText = $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-txt-numberOperator").val();
                    currentFilterOptions[currentFilterData].logicValue = $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-cmb-numberOperator option:selected").val();
                } else if (currentFilterOptions[currentFilterData].dataType == "multiSelect") {
                    var multiOperatorsSelectedValues = [];

                    $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-cmb-multiSelect option:selected").each(function () {
                        multiOperatorsSelectedValues.push($(this).val());
                    });

                    currentFilterOptions[currentFilterData].filterText = multiOperatorsSelectedValues;
                }


                var currentCallerObject = $("#kendoBasicFilterSearchBox").data("callerObject");
                var currentFilterLabels = $("body").find(currentCallerObject).closest("table").find("thead").find("tr.kendo-basicfilter-filter-row").find(".kendo-basicfilter-filter-options");
                $(currentFilterLabels).find("span[data-field='" + currentFilterData + "']").remove();

                if (currentFilterOptions[currentFilterData].filterText != "") {
                    var filterLblSpan = $("<span data-field='" + currentFilterData + "'></span>");
                    var filterLblNumberOperator = "";
                    var filterLblFilterSelectedValues = "";

                    $(filterLblSpan).attr({
                        "data-field": currentFilterData,
                        "data-title": kendoBasicFilterToText(currentFilterTitle)
                    });

                    if (currentFilterOptions[currentFilterData].dataType == "numberOperator") {
                        filterLblNumberOperator = currentFilterOptions[currentFilterData].logicValue + " ";
                    }
                    if (currentFilterOptions[currentFilterData].dataType == "multiSelect") {
                        filterLblFilterSelectedValues = currentFilterOptions[currentFilterData].filterText.join(", ")
                    } else {
                        filterLblFilterSelectedValues = currentFilterOptions[currentFilterData].filterText;
                    }

                    if ("labelTemplate" in currentFilterOptions[currentFilterData]) {
                        var userTemplateTitle = currentFilterOptions[currentFilterData].labelTemplate(currentFilterOptions[currentFilterData], kendoBasicFilterToText(currentFilterTitle));

                        $(filterLblSpan).append(userTemplateTitle || "");
                    } else {
                        $(filterLblSpan).append("<label>" + kendoBasicFilterToText(currentFilterTitle) + ":</label> " + filterLblNumberOperator + filterLblFilterSelectedValues);
                    }

                    $(filterLblSpan).append("<a href='#'><i class='fa fa-close'></i></a>");

                    $(filterLblSpan).find("a").on("click", function (e) {
                        e.preventDefault();
                        var removeCurrentFilterOptions = $(this).closest("table").parent().data("kendoBasicFilter");
                        var removeurrentFilterData = $(this).parent().attr("data-field");
                        var removeurrentFilterTitle = $(this).parent().attr("data-title");

                        $("#kendoBasicFilterSearchBox").data("callerObject", $(this).closest("tr"));
                        $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-btn-filter").attr("data-field", removeurrentFilterData);
                        $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-btn-filter").attr("data-title", kendoBasicFilterToText(removeurrentFilterTitle));
                        $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-btn-filter").data("kendoBasicFilter", removeCurrentFilterOptions);

                        $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-btn-clear").trigger("click");
                    });

                    $(currentFilterLabels).append(filterLblSpan);
                }

                if (currentFilterLabels.find("span").length) {
                    currentFilterLabels.parent().css("display", "");
                } else {
                    currentFilterLabels.parent().css("display", "none");
                }

                kendoBasicFilterApplyFilter(currentFilterOptions, currentCallerObject);

                $("body").find(currentCallerObject).closest("table").parent().data("kendoBasicFilter", currentFilterOptions);

                $("#kendoBasicFilterSearchBox").css("display", "none");

                if ("filterChanged" in currentFilterOptions.filterBoxOptions) {
                    currentFilterOptions.filterBoxOptions.filterChanged(currentFilterOptions);
                }

                return false;
            });

            if (!$("body").data("kendoBasicFilterDocumentEventsRegistered")) {
                $(document).on("click", function (e) {
                    if (e.target.id != 'kendoBasicFilterSearchBox' && !$('#kendoBasicFilterSearchBox').find(e.target).length) {
                        $("#kendoBasicFilterSearchBox").css("display", "none");
                    }
                });
                $(document).on("touchstart", function (e) {
                    if (e.target.id != 'kendoBasicFilterSearchBox' && !$('#kendoBasicFilterSearchBox').find(e.target).length) {
                        $("#kendoBasicFilterSearchBox").css("display", "none");
                    }
                });

                $("body").data("kendoBasicFilterDocumentEventsRegistered", true);
            }
        }

        $(this).find("thead").append("<tr style='display:none;' class='kendo-basicfilter-filter-row'><th colspan='" + $(this).find("thead").find("th").length + "' class='kendo-basicfilter-filter-options'></th></tr>")

        $(this).find(".lnk-kendobasicfilter-current-col-data").each(function () {
            $(this).off("click");
            $(this).on("click", function (e) {
                e.preventDefault();
                e.stopPropagation();

                var currentFilterOptions = $(this).closest("table").parent().data("kendoBasicFilter");
                var currentKendoBasicfilterLnkTrigger = this;
                var currentHeaderTitle = kendoBasicFilterToText($(this).parent().attr("data-title"));
                var currentHeaderData = $(this).parent().attr("data-field");
                var currentFilterOption = currentFilterOptions[currentHeaderData];
                var currentControlCanHaveFocus = false;
                var currentFocusTextBoxFilterControl = "";

                $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-dv-group").css("display", "none");
                $("#kendoBasicFilterSearchBox").data("callerObject", this);
                $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-btn-filter").attr("data-field", currentHeaderData);
                $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-btn-filter").attr("data-title", currentHeaderTitle);
                $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-btn-filter").data("kendoBasicFilter", currentFilterOptions);
                $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-title-lbl").html("filter " + currentHeaderTitle + ":");

                if (currentFilterOption.dataType == "string") {
                    $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-dv-string").css("display", "");
                    currentControlCanHaveFocus = true;
                    currentFocusTextBoxFilterControl = ".kendobasicfilter-filter-txt-string";
                    $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-txt-string").val(currentFilterOption.filterText);
                } else if (currentFilterOption.dataType == "number") {
                    $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-dv-string").css("display", "");
                    currentControlCanHaveFocus = true;
                    currentFocusTextBoxFilterControl = ".kendobasicfilter-filter-txt-string";
                    $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-txt-string").val(currentFilterOption.filterText);
                } else if (currentFilterOption.dataType == "date") {
                    $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-dv-string").css("display", "");
                    currentControlCanHaveFocus = true;
                    currentFocusTextBoxFilterControl = ".kendobasicfilter-filter-txt-string";
                    $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-txt-string").val(currentFilterOption.filterText);
                } else if (currentFilterOption.dataType == "numberOperator") {
                    $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-dv-numberOperator").css("display", "");
                    currentControlCanHaveFocus = true;
                    currentFocusTextBoxFilterControl = ".kendobasicfilter-filter-txt-numberOperator";
                    $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-txt-numberOperator").val(currentFilterOption.filterText);
                    $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-cmb-numberOperator").val((currentFilterOption.logicValue == "" ? "=" : currentFilterOption.logicValue));
                } else if (currentFilterOption.dataType == "multiSelect") {
                    $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-dv-multiSelect").css("display", "");
                    $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-cmb-multiSelect option").remove();

                    if (currentFilterOption.filterText == "") {
                        currentFilterOption.filterText = [];
                    }

                    for (var i = 0; i < currentFilterOption.multiSelectOption.length; i++) {
                        var currentMultiIsSelected = false;
                        for (var j = 0; j < currentFilterOption.filterText.length; j++) {
                            if (currentFilterOption.filterText[j] == currentFilterOption.multiSelectOption[i]) {
                                currentMultiIsSelected = true;
                                break;
                            }
                        }

                        var newMultiselectOptionObject = $("<option />");
                        $(newMultiselectOptionObject).attr("value", currentFilterOption.multiSelectOption[i])
                            .html(currentFilterOption.multiSelectOption[i]);

                        if (currentMultiIsSelected) {
                            $(newMultiselectOptionObject).attr("selected", "selected");
                        }

                        $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-cmb-multiSelect").append(newMultiselectOptionObject);
                    }

                    $("#kendoBasicFilterSearchBox").find(".kendobasicfilter-filter-txt-numberOperator").val(currentFilterOption.filterText);
                }

                $("#kendoBasicFilterSearchBox").css({
                    "visibility": "hidden",
                    "display": ""
                });
                $("#kendoBasicFilterSearchBox").position({
                    my: "left top",
                    at: "left bottom",
                    of: currentKendoBasicfilterLnkTrigger
                });

                $("#kendoBasicFilterSearchBox").css({
                    "visibility": "visible"
                });

                if (currentControlCanHaveFocus) {
                    $("#kendoBasicFilterSearchBox").find(currentFocusTextBoxFilterControl)[0].focus();
                }
            });
        });
    };
}(jQuery));

function kendoBasicFilterApplyFilter(currentFilterOptions, currentCallerObject) {
    /*   1/4/19 - added way to also apply one master text filter accross all columns  */
    var masterFilterText = ("masterFilterText" in currentFilterOptions.filterBoxOptions ? currentFilterOptions.filterBoxOptions.masterFilterText() : "") || "";

    var currentFilterArray = [];
    var currentMasterFilterArray = [];

    $.each(currentFilterOptions, function (filterKey, filterValue) {
        if (filterKey == "filterBoxOptions") {
            return;
        }

        /*   12/20/18 - not adding empty filtertext items   */
        var isFilterTextEmpty = ($.isArray(currentFilterOptions[filterKey].filterText) ?
            (currentFilterOptions[filterKey].filterText.length == 0) :
            (currentFilterOptions[filterKey].filterText == ""));

        if (isFilterTextEmpty && masterFilterText == "") {
            return;
        }

        var currentOperator;

        if (currentFilterOptions[filterKey].dataType == "date") {
            if (currentFilterOptions[filterKey].filterText != "") {
                var currentDateFormat = currentFilterOptions[filterKey].dateFormat || "MM/DD/YYYY";
                currentOperator = function (fieldVal, filterText) {
                    return (!kendoBasicFilterIsNull(fieldVal) && moment(fieldVal).format(currentDateFormat).indexOf(filterText) != -1);
                };

                currentFilterArray.push({
                    field: filterKey,
                    operator: currentOperator,
                    value: currentFilterOptions[filterKey].filterText
                });
            }

            if (masterFilterText != "") {
                var currentDateFormat = currentFilterOptions[filterKey].dateFormat || "MM/DD/YYYY";
                currentOperator = function (fieldVal, filterText) {
                    return (!kendoBasicFilterIsNull(fieldVal) && moment(fieldVal).format(currentDateFormat).indexOf(filterText) != -1);
                };

                currentMasterFilterArray.push({
                    field: filterKey,
                    operator: currentOperator,
                    value: masterFilterText
                });
            }
        } else if (currentFilterOptions[filterKey].dataType == "number") {
            if (currentFilterOptions[filterKey].filterText != "") {
                currentOperator = function (fieldVal, filterText) {
                    return (!kendoBasicFilterIsNull(fieldVal) && (fieldVal + "").indexOf(filterText) != -1);
                };

                currentFilterArray.push({
                    field: filterKey,
                    operator: currentOperator,
                    value: currentFilterOptions[filterKey].filterText
                });
            }

            if (masterFilterText != "") {
                currentOperator = function (fieldVal, filterText) {
                    return (!kendoBasicFilterIsNull(fieldVal) && (fieldVal + "").toLowerCase().indexOf(filterText.toLowerCase()) != -1);
                };

                currentMasterFilterArray.push({
                    field: filterKey,
                    operator: currentOperator,
                    value: masterFilterText
                });
            }
        } else if (currentFilterOptions[filterKey].dataType == "string") {
            if (currentFilterOptions[filterKey].filterText != "") {
                currentOperator = "Contains";

                currentFilterArray.push({
                    field: filterKey,
                    operator: currentOperator,
                    value: currentFilterOptions[filterKey].filterText
                });
            }

            if (masterFilterText != "") {
                currentOperator = "Contains";

                currentMasterFilterArray.push({
                    field: filterKey,
                    operator: currentOperator,
                    value: masterFilterText
                });
            }
        } else if (currentFilterOptions[filterKey].dataType == "numberOperator") {
            if (currentFilterOptions[filterKey].filterText != "") {
                if (currentFilterOptions[filterKey].logicValue == "=") {
                    currentOperator = function (fieldVal, filterText) {
                        if (isNaN(fieldVal) || isNaN(filterText)) {
                            return false;
                        }

                        return (!kendoBasicFilterIsNull(fieldVal) && parseFloat(fieldVal) == parseFloat(filterText));
                    };

                    currentFilterArray.push({
                        field: filterKey,
                        operator: currentOperator,
                        value: currentFilterOptions[filterKey].filterText
                    });
                } else if (currentFilterOptions[filterKey].logicValue == ">") {
                    currentOperator = function (fieldVal, filterText) {
                        if (isNaN(fieldVal) || isNaN(filterText)) {
                            return false;
                        }

                        return (!kendoBasicFilterIsNull(fieldVal) && parseFloat(fieldVal) > parseFloat(filterText));
                    };

                    currentFilterArray.push({
                        field: filterKey,
                        operator: currentOperator,
                        value: currentFilterOptions[filterKey].filterText
                    });
                } else if (currentFilterOptions[filterKey].logicValue == "<") {
                    currentOperator = function (fieldVal, filterText) {
                        if (isNaN(fieldVal) || isNaN(filterText)) {
                            return false;
                        }

                        return (!kendoBasicFilterIsNull(fieldVal) && parseFloat(fieldVal) < parseFloat(filterText));
                    };

                    currentFilterArray.push({
                        field: filterKey,
                        operator: currentOperator,
                        value: currentFilterOptions[filterKey].filterText
                    });
                }
            }

            if (masterFilterText != "") {
                currentOperator = function (fieldVal, filterText) {
                    return (!kendoBasicFilterIsNull(fieldVal) && (fieldVal + "").toLowerCase().indexOf(filterText.toLowerCase()) != -1);
                };

                currentMasterFilterArray.push({
                    field: filterKey,
                    operator: currentOperator,
                    value: masterFilterText
                });
            }
        } else if (currentFilterOptions[filterKey].dataType == "multiSelect") {
            if ($.isArray(currentFilterOptions[filterKey].filterText) && currentFilterOptions[filterKey].filterText.length) {
                currentOperator = function (fieldVal, filterText) {
                    var filterTextArray = $.parseJSON(filterText);
                    var isFilterDesiredOption = false;

                    for (var i = 0; i < filterTextArray.length; i++) {
                        isFilterDesiredOption = !kendoBasicFilterIsNull(fieldVal) && (fieldVal + "").toLowerCase() == (filterTextArray[i] + "").toLowerCase();

                        if (isFilterDesiredOption) {
                            break;
                        }
                    }

                    return isFilterDesiredOption;
                };

                currentFilterArray.push({
                    field: filterKey,
                    operator: currentOperator,
                    value: JSON.stringify(currentFilterOptions[filterKey].filterText)
                });
            }

            if (masterFilterText != "") {
                currentOperator = function (fieldVal, filterText) {
                    return (!kendoBasicFilterIsNull(fieldVal) && (fieldVal + "").toLowerCase().indexOf(filterText.toLowerCase()) != -1);
                };

                currentMasterFilterArray.push({
                    field: filterKey,
                    operator: currentOperator,
                    value: masterFilterText
                });
            }
        }
    });

    var finalFilterOperationControls;

    if (currentFilterArray.length && currentMasterFilterArray.length) {
        finalFilterOperationControls = [];
        finalFilterOperationControls.push({
            logic: "and",
            filters: currentFilterArray
        });
        finalFilterOperationControls.push({
            logic: "or",
            filters: currentMasterFilterArray
        });
    } else {
        if (currentFilterArray.length) {
            finalFilterOperationControls = {
                logic: "and",
                filters: currentFilterArray
            };
        }
        if (currentMasterFilterArray.length) {
            finalFilterOperationControls = {
                logic: "or",
                filters: currentMasterFilterArray
            };
        }
    }

    if (!currentFilterOptions.filterBoxOptions.serverFiltering) {
        $("body").find(currentCallerObject).closest("table").parent().data("kendoGrid").dataSource.filter([]);
        $("body").find(currentCallerObject).closest("table").parent().data("kendoGrid").dataSource.filter(finalFilterOperationControls);
    }
}

function kendoBasicFilterToText(inValue) {
    inValue = inValue.replace(/\<br\>/g, ' ');
    var rawText = $("<div />").append(inValue).text();
    rawText = rawText.replace(/\n/g, ' ');

    return rawText;
}

function kendoBasicFilterIsNull(num) {
    return !num && num + "" == "null" || !num && num + "" == "undefined";
}

/*
    code grabbed from: https://code.google.com/p/jquery-ui/source/browse/trunk/ui/jquery.ui.position.js?r=3897
*/

/*
 * jQuery UI Position @VERSION
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Position
 */
(function ($) {

    $.ui = $.ui || {};

    var horizontalPositions = /left|center|right/,
            horizontalDefault = "center",
            verticalPositions = /top|center|bottom/,
            verticalDefault = "center",
            _position = $.fn.position,
            _offset = $.fn.offset;

    $.fn.position = function (options) {
        if (!options || !options.of) {
            return _position.apply(this, arguments);
        }

        // make a copy, we don't want to modify arguments
        options = $.extend({}, options);

        var target = $(options.of),
                collision = (options.collision || "flip").split(" "),
                offset = options.offset ? options.offset.split(" ") : [0, 0],
                targetWidth,
                targetHeight,
                basePosition;

        if (options.of.nodeType === 9) {
            targetWidth = target.width();
            targetHeight = target.height();
            basePosition = { top: 0, left: 0 };
        } else if (options.of.scrollTo && options.of.document) {
            targetWidth = target.width();
            targetHeight = target.height();
            basePosition = { top: target.scrollTop(), left: target.scrollLeft() };
        } else if (options.of.preventDefault) {
            // force left top to allow flipping
            options.at = "left top";
            targetWidth = targetHeight = 0;
            basePosition = { top: options.of.pageY, left: options.of.pageX };
        } else {
            targetWidth = target.outerWidth();
            targetHeight = target.outerHeight();
            basePosition = target.offset();
        }

        // force my and at to have valid horizontal and veritcal positions
        // if a value is missing or invalid, it will be converted to center
        $.each(["my", "at"], function () {
            var pos = (options[this] || "").split(" ");
            if (pos.length === 1) {
                pos = horizontalPositions.test(pos[0]) ?
                        pos.concat([verticalDefault]) :
                        verticalPositions.test(pos[0]) ?
                                [horizontalDefault].concat(pos) :
                                [horizontalDefault, verticalDefault];
            }
            pos[0] = horizontalPositions.test(pos[0]) ? pos[0] : horizontalDefault;
            pos[1] = verticalPositions.test(pos[1]) ? pos[1] : verticalDefault;
            options[this] = pos;
        });

        // normalize collision option
        if (collision.length === 1) {
            collision[1] = collision[0];
        }

        // normalize offset option
        offset[0] = parseInt(offset[0], 10) || 0;
        if (offset.length === 1) {
            offset[1] = offset[0];
        }
        offset[1] = parseInt(offset[1], 10) || 0;

        if (options.at[0] === "right") {
            basePosition.left += targetWidth;
        } else if (options.at[0] === horizontalDefault) {
            basePosition.left += targetWidth / 2;
        }

        if (options.at[1] === "bottom") {
            basePosition.top += targetHeight;
        } else if (options.at[1] === verticalDefault) {
            basePosition.top += targetHeight / 2;
        }

        basePosition.left += offset[0];
        basePosition.top += offset[1];

        return this.each(function () {
            var elem = $(this),
                    elemWidth = elem.outerWidth(),
                    elemHeight = elem.outerHeight(),
                    position = $.extend({}, basePosition);

            if (options.my[0] === "right") {
                position.left -= elemWidth;
            } else if (options.my[0] === horizontalDefault) {
                position.left -= elemWidth / 2;
            }

            if (options.my[1] === "bottom") {
                position.top -= elemHeight;
            } else if (options.my[1] === verticalDefault) {
                position.top -= elemHeight / 2;
            }

            $.each(["left", "top"], function (i, dir) {
                if ($.ui.position[collision[i]]) {
                    $.ui.position[collision[i]][dir](position, {
                        targetWidth: targetWidth,
                        targetHeight: targetHeight,
                        elemWidth: elemWidth,
                        elemHeight: elemHeight,
                        offset: offset,
                        my: options.my,
                        at: options.at
                    });
                }
            });

            if ($.fn.bgiframe) {
                elem.bgiframe();
            }
            elem.offset($.extend(position, { using: options.using }));
        });
    };

    $.ui.position = {
        fit: {
            left: function (position, data) {
                var win = $(window),
                        over = position.left + data.elemWidth - win.width() - win.scrollLeft();
                position.left = over > 0 ? position.left - over : Math.max(0, position.left);
            },
            top: function (position, data) {
                var win = $(window),
                        over = position.top + data.elemHeight - win.height() - win.scrollTop();
                position.top = over > 0 ? position.top - over : Math.max(0, position.top);
            }
        },

        flip: {
            left: function (position, data) {
                if (data.at[0] === "center") {
                    return;
                }
                var win = $(window),
                        over = position.left + data.elemWidth - win.width() - win.scrollLeft(),
                        myOffset = data.my[0] === "left" ?
                                -data.elemWidth :
                                data.my[0] === "right" ?
                                        data.elemWidth :
                                        0,
                        offset = -2 * data.offset[0];
                position.left += position.left < 0 ?
                        myOffset + data.targetWidth + offset :
                        over > 0 ?
                                myOffset - data.targetWidth + offset :
                                0;
            },
            top: function (position, data) {
                if (data.at[1] === "center") {
                    return;
                }
                var win = $(window),
                        over = position.top + data.elemHeight - win.height() - win.scrollTop(),
                        myOffset = data.my[1] === "top" ?
                                -data.elemHeight :
                                data.my[1] === "bottom" ?
                                        data.elemHeight :
                                        0,
                        atOffset = data.at[1] === "top" ?
                                data.targetHeight :
                                -data.targetHeight,
                        offset = -2 * data.offset[1];
                position.top += position.top < 0 ?
                        myOffset + data.targetHeight + offset :
                        over > 0 ?
                                myOffset + atOffset + offset :
                                0;
            }
        }
    };

    // offset setter from jQuery 1.4
    if (!$.offset.setOffset) {
        $.offset.setOffset = function (elem, options) {
            // set position first, in-case top/left are set even on static elem
            if (/static/.test($.curCSS(elem, "position"))) {
                elem.style.position = "relative";
            }
            var curElem = $(elem),
                    curOffset = curElem.offset(),
                    curTop = parseInt($.curCSS(elem, "top", true), 10) || 0,
                    curLeft = parseInt($.curCSS(elem, "left", true), 10) || 0,
                    props = {
                        top: (options.top - curOffset.top) + curTop,
                        left: (options.left - curOffset.left) + curLeft
                    };

            if ('using' in options) {
                options.using.call(elem, props);
            } else {
                curElem.css(props);
            }
        };

        $.fn.offset = function (options) {
            var elem = this[0];
            if (!elem || !elem.ownerDocument) { return null; }
            if (options) {
                return this.each(function () {
                    $.offset.setOffset(this, options);
                });
            }
            return _offset.call(this);
        };
    }

}(jQuery));