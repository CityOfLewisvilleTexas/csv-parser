"use strict";

// Vue!
var app = new Vue({
    el: "#app",

    // vars
    data: {
        stepper: 1,
        tables: [],
        masks: [],
        mask: '',


        isLoading: {
            tables: false,
            masks: false
        },
        selected: {
            table: ''
        }
    },

    watch: {
        stepper: function() {
            if (this.stepper === 2) this.fetchMasks()
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
                setTimeout(() => {
                    this.handleTables(['table1', 'table2', 'table3', 'table4', 'table5'])
                }, 500)
            }
        },
        handleTables: function(res) {
            this.tables = res
            this.isLoading.tables = false
        },

        // fetch all masks
        fetchMasks: function() {
            if (this.isLoading.masks===false) {
                this.isLoading.masks = true

                // axios('fetch masks')
                setTimeout(() => {
                    this.handleMasks(['mask1', 'mask2', 'mask3', 'mask4', 'mask5'])
                }, 500)
            }
        },
        handleMasks: function(res) {
            this.masks = res
            this.isLoading.masks = false
        },

        // generates random string
        generateRandomMask: function() {
            var text = ""
            var possible = "abcdefghijklmnopqrstuvwxyz"
            for (var i = 0; i < 6; i++) text += possible.charAt(Math.floor(Math.random() * possible.length))
            return text;
        },

        // checks if provided mask is unique
        isUniqueMask: function(mask) {
            return this.masks.indexOf(mask) == -1
        },

        // randomize mask
        fillWithRandomMask: function(context) {
            this.mask = this.generateRandomMask()
            while(!this.isUniqueMask(this.mask))
                this[context] = this.generateRandomMask()
        }
    }
})