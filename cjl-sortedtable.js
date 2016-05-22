/**
 * 
 */
(function($) {
  $.fn.sortedtable = function(sortkeys) {
    /**
     * @property {object} body       - jQuery selection
     */
    this.body = null;

    /**
     * @property {integer} colCount  - Count of columns in the table
     */
    this.colCount = 0;

    /**
     * @property {object[]} cols     - Names of columns in the table, defaults to col_{index}
     */
    this.cols = [ ];

    /**
     * @property {object[]} data     - Array of objects representing table rows
     */
    this.data = [ ];

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
     * @property {object[]} sorts    - Sort keys. Object contains 'name' and 'dir', which is 1 (ascending) or -1 (descending)
     */
    this.sorts = [ ];

    /**
     * Clears the sort keys
     * @returns {void}
     * @function clearSort
     */
    this.clearSort = function() {
      this.sorts = [ ];
      this.setSortAttribute();
    };

    /**
     * Sets the object array containing sort keys
     * @returns {void}
     * @function getSortAttribute
     */
    this.getSortAttribute = function() {
      var c
        , sort_keys = (this.elem.attr('data-sort') || '').split(',')
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
      ME.sorts = ret;
    };

    /**
     * Sets the data-sort attribute on the table using the sort keys
     * @returns {void}
     * @function setSortAttribute
     */
    this.setSortAttribute = function() {
      var c
        , s = [ ]
      ;

      for (c = 0; c < ME.sorts.length; c += 1) {
        s.push(ME.sorts[c].name + (ME.sorts[c].dir === 1 ? '+' : '-'));
      }

      // update the sort indicator
      ME.elem.attr('data-sort', s.join(','));
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

      // make sure sortOn is an array
      sortOn = ($.isArray(sortOn)) ? sortOn : (sortOn ? [sortOn] : [ ]);

      // get any existing sort order
      this.getSortAttribute();
      sort_keys = ME.sorts;

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
                ME.sorts[counter].dir *= -1;
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
            ME.sorts.push({
                name: key.name,
                dir: ord
              });
          }
        }
      }

      // assign a local variable for scope
      sort_keys = ME.sorts;

      // only perform a sort if we have sort keys
      if (sort_keys.length) {
        ME.data.sort(function(a, b) {
            var c = 0
              , compareA
              , compareB
              , isfirst = 0
              , ipv4 = /^(\d+)\.(\d+)\.(\d+)\.(\d+)(\:\d+)?$/
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
              compareA = a[sort_keys[c].name];
              compareB = b[sort_keys[c].name];

              // if A and B are numbers, cast them as numbers
              if (!isNaN(compareA) && !isNaN(compareB)) {
                compareA = compareA * 1;
                compareB = compareB * 1;
              } else if (ipv4.test(compareA) && ipv4.test(compareB)) {
                compareA = compareA.replace(ipv4, ipv4normalized);
                compareB = compareB.replace(ipv4, ipv4normalized);
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
            return isfirst;
          });

        // only render if we've change the order
        ME.body.html(ME.toHtml(true));

        // reattach the click handlers since we've reset the elements
        bodyHandlers();

        // set the data attribute to maintain sort keys
        ME.setSortAttribute();

        // set the sorted class
        setSortedClass();
      }
    };

    /**
     * Returns the HTML of the table as a string
     * @returns {string}
     * @function toHtml
     * @param {boolean} bodyOnly     - Return only the body of the table, without header and footer
     */
    this.toHtml = function(bodyOnly) {
      var c
        , i
        , n
        , s = [ ]
        , t
      ;

      if (!bodyOnly) {
        // add the header
        s.push(outerHtml(ME.head));
      }

      // loop through the data for the body
      for (i = 0; i < ME.data.length; i += 1) {
        s.push(ME.data[i].html);
      }

      if (!bodyOnly) {
        // add the foot
        s.push(outerHtml(ME.foot));
      }

      return s.join('\n');
    };

    // assigns handlers
    function assignHandler($cell) {
      var $label = $cell.prop('tagName').toLowerCase();

      $label = ($label === 'th') ? $cell.text() : 'column ' + $cell.index();

      $cell.addClass('sorter');
      $cell.attr('aria-label', 'Sort by ' + $label);
      $cell.attr('role', 'button');
      $cell.attr('tabindex', 0);
      $cell.on('click', cellClicked);
      $cell.on('keypress', cellKeyed);
    }

    // reattaches the headerless body handlers
    function bodyHandlers() {
      var rows;

      if (!ME.head.length) {
        rows = ME.body.children('tr');
        rows.each(function() {
            $(this).children('td').each(function(index) {
                assignHandler($(this));
              });
          });
      }
    }

    // click handler for a table cell
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

    // keypress handler for a table cell
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

    // this returns all the markup of the provided node
    function outerHtml(htmlNode) {
      var markup = '';
      if (htmlNode && htmlNode.length) {
        markup = $('<div />').append(htmlNode.clone()).html();
      }
      return markup.replace(/\>\s*\</g, '><');
    }

    // reads the table into a dataset
    function parse() {
      // table rows are contained by a thead, tbody, or tfoot
      // rows not contained are put in a virtual tbody so check
      // for a thead or tfoot but don't worry about a tbody

      var $tbl_th = ME.elem.find('th:first').parent()
        , $snippet
      ;

      ME.body = ME.elem.children('tbody').children('tr');
      ME.head = ME.elem.children('thead');

      // only do something when we have a table to parse
      if (ME.body.length) {
        // set the header
        if (!ME.head.length && $tbl_th.length) {
          // get the html of the header row and wrap it in a thead
          $snippet = '<thead>' + outerHtml($tbl_th) + '</thead>';
          // remove the header row from the body
          ME.body.each(function() {
              // if the header is in the body, drop it
              if ($(this).is($tbl_th)) {
                $tbl_th.remove();
              }
            });
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
              ME.cols.push($col);

              // set the sort indicator color
              INDICATOR_COLOR = $col.css('color');

              // add the sort indicator
              $col.append('<span class="indicator"></span>');

              // add the sort handler
              assignHandler($col);

              // disable selection of the column
              $col.attr('unselectable', 'on')
                  .css('user-select', 'none')
                  .on('selectstart', false);
            });
          ME.colCount = ME.cols.length;
        }

        // create the dataset to be sorted
        ME.body.each(function() {
            var obj
              , propCount = 0
            ;

            $(this).children('td').each(function(index) {
                // default the column name to the zero-based index
                var colName = (ME.cols[index] || '').length ? ME.cols[index].text() : 'col_' + index
                  , $cell = $(this)
                ;

                colName = colName || 'col_' + index;
                obj = obj || { };
                obj[colName] = $cell.text();
                propCount += 1;
              });

            if (obj) {
              obj.html = outerHtml($(this));
              ME.data.push(obj);
              ME.colCount = Math.max(ME.colCount, propCount);
            }
          });

        // reset the body
        ME.body = ME.elem.children('tbody')
      }

      return;
    }

    /**
     * Sets the class on sorted columns, i.e., 'sorted' and 'asc' or 'desc'
     */
    function setSortedClass() {
      // loop through the columns in the header and remove the 'sorted' and 'asc'|'desc' class
      // add the appropriate class(es) if the column has a sort key in ME.sorts
      var $head = $(ME.head)
        , $key = null
        , $keys = ME.sorts
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
              'overflow-y:hidden;' +
              'text-align:left;' +
            '}' +
            '.cjl-sortable .indicator {' +
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
              'top:0.75em;' +
              'border-bottom:0 solid transparent;' +
              'border-top:0.5em solid ' + INDICATOR_COLOR + ';' +
            '}' +
            '.cjl-sortable .sorted-desc .indicator {' +
              'top:-0.75em;' +
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
            $colName = $colName || 'col_' + index;

            // remove any existing identifiers
            $col.removeClass('sorted-asc');
            $col.removeClass('sorted-desc');

            // check to see if the column is in the sort keys
            for (index = 0; index < $keys.length; index += 1) {
              $key = $keys[index];
              if ($colName === $key.name) {
                $col.addClass('sorted-' + ($key.dir === 1 ? 'asc' : 'desc'));
              }
            }
          });
      }

      return;
    }

    var ME = this
      , INDICATOR_COLOR = 'rgb(0, 0, 0)'
    ;

    // initialize
    parse();

    // sort according to order specified in markup
    ME.sort(sortkeys, true);

    // return the extended jquery object
    return ME;
  };
}(jQuery));