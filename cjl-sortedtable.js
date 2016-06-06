/**
 * 
 */
(function($) {
  $.fn.sortedtable = function(config) {
    /**
     * @property {object} body       - jQuery selection
     */
    this.body = null;

    /**
     * @property {string} foot       - HTML containing table footer
     */
    this.foot = null;

    /**
     * @property {string} head       - HTML containing table header
     */
    this.head = null;

    /**
     * @property {node} elem         - jQuery element reference to table
     */
    this.elem = $(this);

    /**
     * Clears the sort keys
     * @returns {void}
     * @function clearSort
     */
    this.clearSort = function() {
      SORTS = [ ];
      setSortAttribute();
    };

    /**
     * Sorts the data in the table body
     * @returns {void}
     * @function sort
     * @param {object[]} sortOn      - Each object in the arguments should contain a 'name' and 'dir' property
     * @param {boolean} retain       - Retain existing sort columns
     */
    this.sort = function(sortOn, retain) {
      var counter
        , index
        , is_set
        , key
        , ord
        , sort_keys
      ;

      // trigger an event to indicate start of sort
      this.trigger('sort');

      // make sure sortOn is an array
      sortOn = ($.isArray(sortOn)) ? sortOn : (sortOn ? [sortOn] : [ ]);

      // get any existing sort order
      getSortAttribute();
      sort_keys = SORTS;

      // set sort keys
      if (!retain) {
        ME.clearSort();
      }
      for (index = 0; index < sortOn.length; index += 1) {
        key = sortOn[index];
        is_set = false;
        if (key.name) {
          // check if the column is already set as a sort and we're toggling the direction
          for (counter = 0; counter < sort_keys.length; counter += 1) {
            if (key.name === sort_keys[counter].name) {
              if (retain) {
                SORTS[counter].dir *= -1;
                is_set = true;
                break;
              } else {
                key.dir = sort_keys[counter].dir * -1;
                break;
              }
            }
          }

          if (!is_set) {
            // set the sort order flag
            ord = (key.dir || key.direction);
            if (parseFloat(ord) === 1 || parseFloat(ord) === -1) {
              ord = parseFloat(ord);
            } else if ((/^asc/i).test(ord || 'asc')) {
              ord = 1;
            } else {
              ord = -1;
            }

            // add the sort key to the collection
            SORTS.push({
                name: key.name,
                dir: ord
              });
          }
        }
      }

      // assign a local variable for scope
      sort_keys = SORTS;

      // only perform a sort if we have sort keys
      if (sort_keys.length) {
        DATA.sort(function(a, b) {
            var c = 0
              , col
              , compareA
              , compareB
              , isfirst = 0
              , ipv4 = /^(\d+)\.(\d+)\.(\d+)\.(\d+)(\:\d+)?$/
              , hex = /^[a-f0-9]{1,}$/i
            ;

            function ipv4normalized(match, p1, p2, p3, p4, p5, offset, string) {
              var s = [ ]
                , c
              ;

              // normalize the IPv4 address
              s.push(('000'+p1).substr(-3));
              s.push(('000'+p2).substr(-3));
              s.push(('000'+p3).substr(-3));
              s.push(('000'+p4).substr(-3));
              s = s.join('.');

              // normalize the port
              if (p5) {
                s += ':' + ('00000'+p5.replace(/\:/, '')).substr(-5);
              }

              return s;
            }

            while (c < sort_keys.length && isfirst === 0) {
              col = sort_keys[c].name;

              // use the sort key if it's not excluded
              if ($.inArray(col, settings.exclude) < 0) {
                compareA = a[col];
                compareB = b[col];

                // convert A and B if they're a special type
                if (compareA === undefined || compareB === undefined) {
                  c += 1;
                  continue;
                } else if (!isNaN(compareA) && !isNaN(compareB)) {
                  compareA = compareA * 1;
                  compareB = compareB * 1;
                } else if (ipv4.test(compareA) && ipv4.test(compareB)) {
                  compareA = compareA.replace(ipv4, ipv4normalized);
                  compareB = compareB.replace(ipv4, ipv4normalized);
                } else if (hex.test(compareA.replace(/\s/g, '')) && hex.test(compareB.replace(/\s/g, ''))) {
                  compareA = parseInt(compareA, 16);
                  compareB = parseInt(compareB, 16);
                }

                // return the order based on the compared values
                if (compareA > compareB) {
                  isfirst = (sort_keys[c].dir || 1) * 1;
                } else if (compareA < compareB) {
                  isfirst = (sort_keys[c].dir || 1) * -1;
                } else {
                  c += 1;
                }
              }
            }
            return isfirst;
          });

        // only render if we've change the order
        ME.body.html(renderBody());

        // reattach the click handlers since we've reset the elements
        bodyHandlers();

        // set the data attribute to maintain sort keys
        setSortAttribute();

        // set the sorted class
        setSortedClass();
      }

      // trigger event indicating sort is complete
      this.trigger('sorted');
    };

    /**
     * Assigns handlers for sorting
     * @returns {void}
     * @param {JQuerySelection} $cell
     */
    function assignHandler($cell) {
      var $label = $cell.prop('tagName').toLowerCase();

      $label = ($label === 'th') ? $cell.text() : 'column ' + $cell.index();
      $label = ($label || 'column ' + ($cell.index() + 1));

      $cell.attr('aria-label', 'Sort by ' + $label);
      $cell.attr('role', 'button');
      $cell.attr('tabindex', 0);
      $cell.on('click', cellClicked);
      $cell.on('keypress', cellKeyed);
    }

    /**
     * Reattaches handlers to TD nodes after nodes have been replaced
     * @returns {void}
     */
    function bodyHandlers() {
      var rows;

      if (!ME.head.length) {
        rows = ME.body.children('tr');
        rows.each(function() {
            $(this).children('td').each(function(index) {
                var $col = $(this);

                if (!checkExclude($col)) {
                  // add the sort handler
                  assignHandler($col);
                }
              });
          });
      }
    }

    /**
     * The click handler for a table cell
     * @returns {void}
     * @param {Event} evt
     */
    function cellClicked(evt) {
      var $cell = $(this)
        , $label = $cell.prop('tagName').toLowerCase()
        , $text = $cell.text()
      ;

      $label = ($label === 'th' && $text) ? $text : 'col_' + $cell.index();
      evt.preventDefault();
      evt.stopPropagation();
      ME.sort({name:$label}, evt.shiftKey);
    }

    /**
     * The keypress handler for a table cell
     * @returns {void}
     * @param {Event} evt
     */
    function cellKeyed(evt) {
      var $cell = $(this)
        , $key = evt.which
        , $label = $cell.prop('tagName').toLowerCase()
        , $text = $cell.text()
      ;

      // do a sort if the key entered is enter (13) or space (32)
      if ($key === 13 || $key === 32) {
        $label = ($label === 'th' && $text) ? $text : 'col_' + $cell.index();
        evt.preventDefault();
        evt.stopPropagation();
        ME.sort({name:$label}, evt.shiftKey);
      }
    }

    /**
     * Adds the item to the excluded array if it is not already tracked
     * @returns {void}
     * @param {string|JQuerySelection} $cell
     */
    function checkExclude($cell) {
      var $label
        , $exclude = false
      ;

      // if the function is called with a string, automatically exclude it
      if (typeof $cell === 'string') {
        $label = $cell.replace(/^\s*|\s*$/g, '');
        $exclude = true;
      } else {
        $label = $cell.prop('tagName').toLowerCase();
        $label = ($label === 'th') ? $cell.text() : 'column ' + $cell.index();
        $exclude = ($cell.attr('data-sort-exclude') || '').toLowerCase() === 'true';
      }

      if ($label) {
        // add the column if we need to exclude it
        if ($.inArray($label, settings.exclude) < 0 && $exclude) {
          settings.exclude.push($label);
        }

        return ($.inArray($label, settings.exclude) > -1);
      }
      return false;
    }

    /**
     * Reads the number of columns in the table
     * @returns {integer}
     */
    function getColumnCount() {
      var cols = 0;

      ME.elem.children('tbody').children('tr').each(function(){
          var inrow = 0;
          $(this).children('td').each(function(){
              var colSpan = $(this).attr('colspan');
              inrow += (colSpan || 1);
            });
          cols = Math.max(cols, inrow);
        });

      return cols;
    }

    /**
     * Sets the object array containing sort keys
     * @returns {void}
     */
    function getSortAttribute() {
      var c
        , sort_keys = (ME.elem.attr('data-sort') || '').split(',')
        , parsed
        , pattern = /^\s*([\w\-]+)([\+\-])\s*$/
        , ret = [ ]
      ;

      for (c = 0; c < sort_keys.length; c += 1) {
        parsed = pattern.exec(sort_keys[c])
        if (parsed) {
          ret.push({name:parsed[1], dir:(/^(asc|\+)/i).test(parsed[2]) ? 1 : -1});
        }
      }

      // update the sort keys array
      SORTS = ret;
    }

    /**
     * Returns all the markup of the provided node
     * @returns {string}
     * @param {JQuerySelection} $node
     */
    function outerHtml($node) {
      var markup = '';
      if ($node && $node.length) {
        markup = $('<div />').append($node.clone()).html();
      }
      return markup.replace(/\>\s*\</g, '><');
    }

    /**
     * Reads the table markup into a dataset and sort instructions
     * @returns {void}
     */
    function parse() {
      // table rows are contained by a thead, tbody, or tfoot
      // rows not contained are put in a virtual tbody so check
      // for a thead or tfoot but don't worry about a tbody

      var $tbl_th = ME.elem.find('th:first').parent()
        , $snippet
        , index
      ;

      ME.body = ME.elem.children('tbody').children('tr');
      ME.head = ME.elem.children('thead');

      // only do something when we have a table to parse
      if (ME.body.length) {
        // set any excluded sort columns
        $snippet = (ME.elem.attr('data-sort-exclude') || '').split(',');
        for (index = 0; index < $snippet.length; index += 1) {
          checkExclude($snippet[index]);
        }

        // set the header
        if (!ME.head.length) {
          if ($tbl_th.length) {
            // get the html of the header row and wrap it in a thead
            $snippet = '<thead>' + outerHtml($tbl_th) + '</thead>';
            // remove the header row from the body
            ME.body.each(function() {
                // if the header is in the body, drop it
                if ($(this).is($tbl_th)) {
                  $tbl_th.remove();
                }
              });
          } else {
            $snippet = '<thead>';
            for (index = getColumnCount(); index > 0; index -= 1) {
              $snippet += '<th></th>';
            }
            $snippet += '</thead>';
          }

          // append the new header row to the table and reset the header
          ME.elem.prepend($snippet);
          ME.head = ME.elem.children('thead');
        }

        // set the footer to the footer node
        ME.foot = ME.elem.children('tfoot');

        // configure the columns for sorting
        if (ME.head.length) {
          ME.head.children('tr').children().each(function() {
              var $col = $(this);

              // add the column to the columns collection
              COLS.push($col);

              // set the sort indicator color
              INDICATOR_COLOR = $col.css('color');

              // add the sort indicator
              $col.append('<span class="indicator"></span>');

              // handle exclusion
              if (!checkExclude($col)) {
                // add the sort handler
                assignHandler($col);
                $col.addClass('sorter');
              } else {
                $col.addClass('sorter disabled');
              }

              // disable selection of the column
              $col.attr('unselectable', 'on')
                  .css('user-select', 'none')
                  .on('selectstart', false);
            });
          COL_COUNT = COLS.length;
        }

        // create the dataset to be sorted
        ME.body.each(function() {
            var obj
              , propCount = 0
            ;

            $(this).children('td').each(function(index) {
                // default the column name to the zero-based index
                var colName = (COLS[index] || '').length ? COLS[index].text() : 'col_' + index
                  , $cell = $(this)
                ;

                // check to see if we should be excluding it from the sort order
                checkExclude($cell);

                colName = colName || 'col_' + index;
                obj = obj || { };
                obj[colName] = $cell.text();
                propCount += 1;
              });

            if (obj) {
              obj.html = outerHtml($(this));
              DATA.push(obj);
              COL_COUNT = Math.max(COL_COUNT, propCount);
            }
          });

        // reset the body
        ME.body = ME.elem.children('tbody')
      }

      return;
    }

    /**
     * Returns the HTML of the table body string
     * @returns {string}
     */
    function renderBody() {
      var i
        , s = [ ]
      ;

      // loop through the data for the body
      for (i = 0; i < DATA.length; i += 1) {
        s.push(DATA[i].html);
      }

      return s.join('\n');
    }

    /**
     * Sets the data-sort attribute on the table using the sort keys
     * @returns {void}
     */
    function setSortAttribute() {
      var c
        , s = [ ]
      ;

      for (c = 0; c < SORTS.length; c += 1) {
        s.push(SORTS[c].name + (SORTS[c].dir === 1 ? '+' : '-'));
      }

      // update the sort indicator
      ME.elem.attr('data-sort', s.join(','));
    }

    /**
     * Sets the class on sorted columns, i.e., 'sorted' and 'asc' or 'desc'
     * @returns {void}
     */
    function setSortedClass() {
      // loop through the columns in the header and remove the 'sorted' and 'asc'|'desc' class
      // add the appropriate class(es) if the column has a sort key in SORTS
      var $head = $(ME.head)
        , $key = null
        , $keys = SORTS
        , $style = $('#cjl-sortable-style')
        , $tr
      ;

      if ($head.length) {
        // add the style if it's not present
        if (!$style.length) {
          // set the style
          $(document.head).append(
            '<style id="cjl-sortable-style" type="text/css">' +
            '.cjl-sortable .sorter {' +
              'cursor:pointer;' +
              'font-weight:bold;' +
              'height:1.2em;' +
              'overflow:hidden;' +
              'text-align:left;' +
            '}' +
            '.cjl-sortable .sorter:hover {' +
              'outline:2px auto -webkit-focus-ring-color;' +
            '}' +
            '.cjl-sortable .sorter.disabled {' +
              'font-weight:normal;' +
            '}' +
            '.cjl-sortable .sorter.disabled:hover {' +
              'outline:none;' +
            '}' +
            '.cjl-sortable .indicator {' +
              'display:inline-block;' +
              'float:right;' +
              'height:0;' +
              'margin-left:0.5em;' +
              'position:relative;' +
              'width:0;' +
              'border-bottom:none;' +
              'border-left:0.5em solid transparent;' +
              'border-right:0.5em solid transparent;' +
              'border-top:none;' +
            '}' +
            '.cjl-sortable .sorted-asc .indicator {' +
              'top:0.2em;' +
              'border-bottom:0 solid transparent;' +
              'border-top:0.5em solid ' + INDICATOR_COLOR + ';' +
            '}' +
            '.cjl-sortable .sorted-desc .indicator {' +
              'top:0.3em;' +
              'border-bottom:0.5em solid ' + INDICATOR_COLOR + ';' +
              'border-top:0 solid transparent;' +
            '}' +
           '</style>'
          );
        }

        // adjust for different markup (thead vs. no thead)
        $tr = $head.children('tr');
        $tr = $tr.length ? $tr : $head;
        // loop through the column headings
        $tr.children().each(function() {
            var $col = $(this)
              , $colName = $col.text()
              , index
            ;

            // use the default property name if the column heading is blank
            $colName = $colName || 'col_' + $col.index();

            // remove any existing identifiers
            $col.removeClass('sorted-asc');
            $col.removeClass('sorted-desc');

            // check to see if the column is in the sort keys
            for (index = 0; index < $keys.length; index += 1) {
              $key = $keys[index];
              if ($colName === $key.name && $.inArray($colName, settings.exclude) < 0) {
                $col.addClass('sorted-' + ($key.dir === 1 ? 'asc' : 'desc'));
              }
            }
          });
      }

      return;
    }

    var ME = this
      , INDICATOR_COLOR = 'rgb(0, 0, 0)'         // Color of the text in the header, used as the color for the up/down arrow
      , DATA = [ ]                               // Array of objects representing table rows
      , COL_COUNT = 0                            // Count of columns
      , COLS = [ ]                               // Names of columns in the table, defaults to col_{index}
      , SORTS = [ ]                              // Sort keys. Object contains 'name' and 'dir', which is 1 (ascending) or -1 (descending)
      , settings                                 // The settings passed in to the object
      , keys = [ ]                               // Object array containing sort order
    ;

    // handle an array passed in instead of an object
    if ($.isArray(config)) {
      keys = config;
      config = { };
    }

    // initialize the settings
    settings = $.extend({
        sort: keys,
        exclude: [ ]
      }, config);

    // initialize
    parse();

    // sort according to order specified in the call
    if ($.isArray(settings.sort)) {
      ME.sort(settings.sort, true);
    }

    // return the extended jquery object
    return ME;
  };
}(jQuery));