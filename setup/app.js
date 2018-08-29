"use strict";

// Vue!
var app = new Vue({
    el: "#app",

    // vars
    data: {
        stepper: 1,
        tables: [],
        isLoading: {
            tables: false
        },
        selected: {
            table: ''
        }
    },

    // start here
    mounted: function() {
        this.fetchTables()
    },

    // functions
    methods: {

        // fetch all tables in [CSVUploadApp]
        fetchTables: function() {
            if (this.isLoading.tables===false) {
                this.isLoading.tables = true

                // axios('fetch tables')
                this.handleTables(['table1', 'table2', 'table3', 'table4', 'table5'])
            }
        },
        handleTables: function(res) {
            this.tables = res
        }
    }
})