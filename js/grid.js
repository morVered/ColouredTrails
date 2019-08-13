// http://slavchoslavchev.com/tutorials/building-a-grid-matrix-in-javascript/
(function( global ) {
    "use strict";
  
    function Cell( config ) {
      this.$el = config.$element;
      this.x = config.x;
      this.y = config.y;
      this.class = config.class;
    }
  
    function Grid( config ) {
      this.grid = [];
      this.cells = [];
      this.rowsCount = config.rows;
      this.colsCount = config.cols;
      this.rows = [];
      this.cols = [];
      this.map_colour = config.map_colour;
      this.map_chipnumber = config.map_chipnumber;
      if (config.render) {
        this.placeholder = config.render.placeholder;
        this.render();
      }
    }
    Grid.prototype = {
      createCell: function( config ) {
        return new Cell(config);
      },
      getCellAt: function( x, y ) {
        if (!this.grid[y]) {
          console.warn("No such Y coordinate: %i (grid size is: x[%i], y[%i])", y, this.colsCount, this.rowsCount);
          return false;
        }
        if (!this.grid[y][x]) {
          console.warn("No such X coordinate: %i (grid size is: x[%i], y[%i])", x, this.colsCount, this.rowsCount);
          return false;
        }
        return this.grid[y][x];
      },
      render: function( options ) {
        if (options && options.placeholder) {
          this.placeholder = options.placeholder;
        }
        this.$placeholder = $(this.placeholder);
        if (!this.placeholder || this.$placeholder.length === 0) {
          console.error('Placeholder is not present');
          return;
        }
        var i, j, $row, $cell, cell, cellId = 0;
        var cell_counter = 0;
        for (i = 0; i < this.rowsCount; i += 1) {
          this.grid[i] = [];
          $row = $('<div class="row"></div>').appendTo(this.$placeholder);
          for (j = 0; j < this.colsCount; j += 1) {
            var cell_content = "";
            if(typeof map_chipnumber !== 'undefined') { cell_content = this.map_chipnumber[cell_counter]}
            $cell = $('<div class="cell ' + this.map_colour[cell_counter] + '" id="' + i + '-' + j + '" onclick="clickedCell(' + i + ',' + j + ')">' + cell_content + '</div>').appendTo($row);
            cell = this.createCell({$element: $cell, x: j, y: i});
            this.grid[i].push(cell);
            this.cells.push(cell);
            cell_counter++;
          }
        }
        // rows
        var self = this;
        this.grid.forEach(function( row ) {
          self.rows.push(row);
        });
      }
    };
  
    global.Grid = Grid;
  
  }( window ));