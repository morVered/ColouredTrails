(function( global ) {
    "use strict";
  
    //MOR changed to less colours
    var colours = ['blue', 'red', 'white', 'yellow', 'green']//, 'orange', 'grey', 'brown', 'purple', 'teal']

    function Cell( config ) {
      this.$el = config.$element;
      this.x = config.x;
      this.y = config.y;
    }
  
    function ChipGrid( config ) {
      this.grid = [];
      this.cells = [];
      this.rowsCount = 1;
      //MOR changed to less colours
      this.colsCount = 5;//10
      this.rows = [];
      this.cols = [];
      this.colour_chips = config.colour_chips;
      this.player = config.player;
      if (config.render) {
        this.placeholder = config.render.placeholder;
        this.render();
      }
    }
    ChipGrid.prototype = {
      createCell: function( config ) {
        return new Cell(config);
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
        
        this.grid[i] = [];
        $row = $('<div class="row"></div>').appendTo(this.$placeholder);
        for (j = 0; j < this.colsCount; j += 1) {
          $cell = $('<div class="cell-colour cell-' + colours[j] + '">' + this.colour_chips[this.player][j] + '</div>').appendTo($row);
          cell = this.createCell({$element: $cell, x: j, y: i});
          this.grid[i].push(cell);
          this.cells.push(cell);
        }
        
        // rows
        var self = this;
        this.grid.forEach(function( row ) {
          self.rows.push(row);
        });
      }
    };
  
    global.ChipGrid = ChipGrid;
  
  }( window ));