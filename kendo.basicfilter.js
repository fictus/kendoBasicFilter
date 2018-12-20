/*
    kendoBasicFilter ver: 1.0


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

        $(this).find("thead").find("tr").first().find("th").each(function () {
            var filterBtnField = $(this).attr("data-field");
            console.log(filterBtnField);
            if (filterBtnField in defaultFilterOptions) {
                $(this).find(".lnk-kendobasicfilter-current-col-data").remove();
                $(this).append("<a class='lnk-kendobasicfilter-current-col-data' href='#'><i class='fa fa-filter'></i></a>");
                $(this).addClass("kendobasicfilter-column");
            }
        });
        //$(this).find("thead").find("th").each(function () {
        //    if (!$(this).is("[data-filterableheader='false']")) {
        //        gridFilter[$(this).attr("data-field")] = {
        //            filterText: "",
        //            dataType: "string"
        //        };

        //        $(this).find(".lnk-kendobasicfilter-current-col-data").remove();
        //        $(this).append("<a class='lnk-kendobasicfilter-current-col-data' href='#'><i class='fa fa-filter'></i></a>");
        //    }
        //});
        
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

                var currentFilterArray = [];
                $.each(currentFilterOptions, function (filterKey, filterValue) {
                    if (filterKey == "filterBoxOptions") {
                        return;
                    }

                    /*   12/20/18 - not adding empty filtertext items   */
                    var isFilterTextEmpty = ($.isArray(currentFilterOptions[filterKey].filterText) ?
                        (currentFilterOptions[filterKey].filterText.length == 0) :
                        (currentFilterOptions[filterKey].filterText == ""));
                    
                    if (isFilterTextEmpty) {
                        return;
                    }

                    var currentOperator;

                    if (currentFilterOptions[filterKey].dataType == "date") {
                        var currentDateFormat = currentFilterOptions[filterKey].dateFormat || "MM/DD/YYYY";
                        currentOperator = function (fieldVal, filterText) {
                            return !isNull(fieldVal) && moment(fieldVal).format(currentDateFormat).indexOf(filterText) != -1;
                        };

                        currentFilterArray.push({
                            field: filterKey,
                            operator: currentOperator,
                            value: currentFilterOptions[filterKey].filterText
                        });
                    } else if (currentFilterOptions[filterKey].dataType == "number") {
                        currentOperator = function (fieldVal, filterText) {
                            return !isNull(fieldVal) && (fieldVal + "").indexOf(filterText) != -1;
                        };

                        currentFilterArray.push({
                            field: filterKey,
                            operator: currentOperator,
                            value: currentFilterOptions[filterKey].filterText
                        });
                    } else if (currentFilterOptions[filterKey].dataType == "string") {
                        currentOperator = "contains";

                        currentFilterArray.push({
                            field: filterKey,
                            operator: currentOperator,
                            value: currentFilterOptions[filterKey].filterText
                        });
                    } else if (currentFilterOptions[filterKey].dataType == "numberOperator") {
                        if (currentFilterOptions[filterKey].logicValue == "=") {
                            currentOperator = function (fieldVal, filterText) {
                                return !isNull(fieldVal) && (fieldVal + "").indexOf(filterText) != -1;
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

                                return !isNull(fieldVal) && parseFloat(fieldVal) > parseFloat(filterText);
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

                                return !isNull(fieldVal) && parseFloat(fieldVal) < parseFloat(filterText);
                            };

                            currentFilterArray.push({
                                field: filterKey,
                                operator: currentOperator,
                                value: currentFilterOptions[filterKey].filterText
                            });
                        }
                    } else if (currentFilterOptions[filterKey].dataType == "multiSelect") {
                        if ($.isArray(currentFilterOptions[filterKey].filterText) && currentFilterOptions[filterKey].filterText.length) {
                            currentOperator = function (fieldVal, filterText) {
                                var filterTextArray = $.parseJSON(filterText);
                                var isFilterDesiredOption = false;

                                for (var i = 0; i < filterTextArray.length; i++) {
                                    isFilterDesiredOption = !isNull(fieldVal) && (fieldVal + "").toLowerCase() == (filterTextArray[i] + "").toLowerCase();

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
                    }
                });

                if (!currentFilterOptions.filterBoxOptions.serverFiltering) {
                    $("body").find(currentCallerObject).closest("table").parent().data("kendoGrid").dataSource.filter([]);
                    $("body").find(currentCallerObject).closest("table").parent().data("kendoGrid").dataSource.filter({
                        logic: "and",
                        filters: currentFilterArray
                    });
                }

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

                var currentFilterArray = [];
                $.each(currentFilterOptions, function (filterKey, filterValue) {
                    if (filterKey == "filterBoxOptions") {
                        return;
                    }

                    /*   12/20/18 - not adding empty filtertext items   */
                    var isFilterTextEmpty = ($.isArray(currentFilterOptions[filterKey].filterText) ?
                        (currentFilterOptions[filterKey].filterText.length == 0) :
                        (currentFilterOptions[filterKey].filterText == ""));
                    
                    if (isFilterTextEmpty) {
                        return;
                    }

                    var currentOperator;

                    if (currentFilterOptions[filterKey].dataType == "date") {
                        var currentDateFormat = currentFilterOptions[filterKey].dateFormat || "MM/DD/YYYY";
                        currentOperator = function (fieldVal, filterText) {
                            return !isNull(fieldVal) && moment(fieldVal).format(currentDateFormat).indexOf(filterText) != -1;
                        };

                        currentFilterArray.push({
                            field: filterKey,
                            operator: currentOperator,
                            value: currentFilterOptions[filterKey].filterText
                        });
                    } else if (currentFilterOptions[filterKey].dataType == "number") {
                        currentOperator = function (fieldVal, filterText) {
                            return !isNull(fieldVal) && (fieldVal + "").indexOf(filterText) != -1;
                        };

                        currentFilterArray.push({
                            field: filterKey,
                            operator: currentOperator,
                            value: currentFilterOptions[filterKey].filterText
                        });
                    } else if (currentFilterOptions[filterKey].dataType == "string") {
                        currentOperator = "contains";

                        currentFilterArray.push({
                            field: filterKey,
                            operator: currentOperator,
                            value: currentFilterOptions[filterKey].filterText
                        });
                    } else if (currentFilterOptions[filterKey].dataType == "numberOperator") {
                        if (currentFilterOptions[filterKey].logicValue == "=") {
                            currentOperator = function (fieldVal, filterText) {
                                return !isNull(fieldVal) && parseFloat(fieldVal) == parseFloat(filterText);
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

                                return !isNull(fieldVal) && parseFloat(fieldVal) > parseFloat(filterText);
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

                                return !isNull(fieldVal) && parseFloat(fieldVal) < parseFloat(filterText);
                            };

                            currentFilterArray.push({
                                field: filterKey,
                                operator: currentOperator,
                                value: currentFilterOptions[filterKey].filterText
                            });
                        }
                    } else if (currentFilterOptions[filterKey].dataType == "multiSelect") {
                        if ($.isArray(currentFilterOptions[filterKey].filterText) && currentFilterOptions[filterKey].filterText.length) {
                            currentOperator = function (fieldVal, filterText) {
                                var filterTextArray = $.parseJSON(filterText);
                                var isFilterDesiredOption = false;

                                for (var i = 0; i < filterTextArray.length; i++) {
                                    isFilterDesiredOption = !isNull(fieldVal) && (fieldVal + "").toLowerCase() == (filterTextArray[i] + "").toLowerCase();

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
                    }
                });

                if (!currentFilterOptions.filterBoxOptions.serverFiltering) {
                    $("body").find(currentCallerObject).closest("table").parent().data("kendoGrid").dataSource.filter([]);
                    $("body").find(currentCallerObject).closest("table").parent().data("kendoGrid").dataSource.filter({
                        logic: "and",
                        filters: currentFilterArray
                    });
                }

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

function kendoBasicFilterToText(inValue) {
    inValue = inValue.replace(/\<br\>/g, ' ');
    var rawText = $("<div />").append(inValue).text();
    rawText = rawText.replace(/\n/g, ' ');

    return rawText;
}