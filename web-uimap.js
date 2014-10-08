module.exports = function() {

    var fs = require('fs');

    // Common Functions & Object Extensions

    // * *
//  * Given a string literal that would appear in an XPath, puts it in quotes and
//  * returns it.Special consideration is given to literals who themselves
//  * contain quotes.It's possible for a concat() expression to be returned.
//  * /
    String.prototype.quoteForXPath = function()
    {
        if (/\'/.test(this)) {
            if (/\"/.test(this)) {
                // concat scenario
                var pieces = [];
                var a = "'", b = '"', c;
                for (var i = 0, j = 0; i < this.length; ) {
                    if (this.charAt(i) == a) {
                        // encountered a quote that cannot be contained in current
                        // quote, so need to flip-flop quoting scheme
                        if (j < i) {
                            pieces.push(a + this.substring(j, i) + a);
                            j = i;
                        }
                        c = a;
                        a = b;
                        b = c;
                    }
                    else {
                        ++i;
                    }
                }
                pieces.push(a + this.substring(j) + a);
                return 'concat(' + pieces.join(', ') + ')';
            }
            else {
                // quote with doubles
                return '"' + this + '"';
            }
        }
        // quote with singles
        return "'" + this + "'";
    };


//******************************************************************************
// UI-Element

    /**
     * Escapes the special regular expression characters in a string intended to be
     * used as a regular expression.
     *
     * Based on: http://simonwillison.net/2006/Jan/20/escape/
     */
    RegExp.escape = (function() {
        var specials = [
            '/', '.', '*', '+', '?', '|', '^', '$',
            '(', ')', '[', ']', '{', '}', '\\'
        ];

        var sRE = new RegExp(
                '(\\' + specials.join('|\\') + ')', 'g'
                );

        return function(text) {
            return text.replace(sRE, '\\$1');
        }
    })();

    /*
     * Copyright 2011 Software Freedom Conservancy
     *
     *  Licensed under the Apache License, Version 2.0 (the "License");
     *  you may not use this file except in compliance with the License.
     *  You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     *  Unless required by applicable law or agreed to in writing, software
     *  distributed under the License is distributed on an "AS IS" BASIS,
     *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     *  See the License for the specific language governing permissions and
     *  limitations under the License.
     *
     */


    /**
     * Parses a python-style keyword arguments string and returns the pairs in a
     * new object.
     *
     * @param  kwargs  a string representing a set of keyword arguments. It should
     *                 look like <tt>keyword1=value1, keyword2=value2, ...</tt>
     * @return         an object mapping strings to strings
     */
    function parse_kwargs(kwargs)
    {
        var args = new Object();
        var pairs = kwargs.split(/,/);
        for (var i = 0; i < pairs.length; ) {
            if (i > 0 && pairs[i].indexOf('=') == -1) {
                // the value string contained a comma. Glue the parts back together.
                pairs[i - 1] += ',' + pairs.splice(i, 1)[0];
            }
            else {
                ++i;
            }
        }
        for (var i = 0; i < pairs.length; ++i) {
            var splits = pairs[i].split(/=/);
            if (splits.length == 1) {
                continue;
            }
            var key = splits.shift();
            var value = splits.join('=');
            args[key.trim()] = value.trim();
        }
        return args;
    }

    /**
     * Emulates php's print_r() functionality. Returns a nicely formatted string
     * representation of an object. Very useful for debugging.
     *
     * @param object    the object to dump
     * @param maxDepth  the maximum depth to recurse into the object. Ellipses will
     *                  be shown for objects whose depth exceeds the maximum.
     * @param indent    the string to use for indenting progressively deeper levels
     *                  of the dump.
     * @return          a string representing a dump of the object
     */
    function print_r(object, maxDepth, indent)
    {
        var parentIndent, attr, str = "";
        if (arguments.length == 1) {
            var maxDepth = Number.MAX_VALUE;
        } else {
            maxDepth--;
        }
        if (arguments.length < 3) {
            parentIndent = ''
            var indent = '    ';
        } else {
            parentIndent = indent;
            indent += '    ';
        }

        switch (typeof (object)) {
            case 'object':
                if (object.length != undefined) {
                    if (object.length == 0) {
                        str += "Array ()\r\n";
                    }
                    else {
                        str += "Array (\r\n";
                        for (var i = 0; i < object.length; ++i) {
                            str += indent + '[' + i + '] => ';
                            if (maxDepth == 0)
                                str += "...\r\n";
                            else
                                str += print_r(object[i], maxDepth, indent);
                        }
                        str += parentIndent + ")\r\n";
                    }
                }
                else {
                    str += "Object (\r\n";
                    for (attr in object) {
                        str += indent + "[" + attr + "] => ";
                        if (maxDepth == 0)
                            str += "...\r\n";
                        else
                            str += print_r(object[attr], maxDepth, indent);
                    }
                    str += parentIndent + ")\r\n";
                }
                break;
            case 'boolean':
                str += (object ? 'true' : 'false') + "\r\n";
                break;
            case 'function':
                str += "Function\r\n";
                break;
            default:
                str += object + "\r\n";
                break;

        }
        return str;
    }

    /**
     * Creates a python-style keyword arguments string from an object.
     *
     * @param args        an associative array mapping strings to strings
     * @param sortedKeys  (optional) a list of keys of the args parameter that
     *                    specifies the order in which the arguments will appear in
     *                    the returned kwargs string
     *
     * @return            a kwarg string representation of args
     */
    function to_kwargs(args, sortedKeys)
    {
        var s = '';
        if (!sortedKeys) {
            var sortedKeys = keys(args).sort();
        }
        for (var i = 0; i < sortedKeys.length; ++i) {
            var k = sortedKeys[i];
            if (args[k] != undefined) {
                if (s) {
                    s += ', ';
                }
                s += k + '=' + args[k];
            }
        }
        return s;
    }

    /**
     * Create a clone of an object and return it. This is a deep copy of everything
     * but functions, whose references are copied. You shouldn't expect a deep copy
     * of functions anyway.
     *
     * @param orig  the original object to copy
     * @return      a deep copy of the original object. Any functions attached,
     *              however, will have their references copied only.
     */
    function clone(orig) {
        var copy;
        switch (typeof (orig)) {
            case 'object':
                copy = (orig.length) ? [] : {};
                for (var attr in orig) {
                    copy[attr] = clone(orig[attr]);
                }
                break;
            default:
                copy = orig;
                break;
        }
        return copy;
    }

    /**
     * Emulates python's range() built-in. Returns an array of integers, counting
     * up (or down) from start to end. Note that the range returned is up to, but
     * NOT INCLUDING, end.
     *.
     * @param start  integer from which to start counting. If the end parameter is
     *               not provided, this value is considered the end and start will
     *               be zero.
     * @param end    integer to which to count. If omitted, the function will count
     *               up from zero to the value of the start parameter. Note that
     *               the array returned will count up to but will not include this
     *               value.
     * @return       an array of consecutive integers. 
     */
    function range(start, end)
    {
        if (arguments.length == 1) {
            var end = start;
            start = 0;
        }

        var r = [];
        if (start < end) {
            while (start != end)
                r.push(start++);
        }
        else {
            while (start != end)
                r.push(start--);
        }
        return r;
    }

    /**
     * Return an array containing all properties of an object. Perl-style.
     *
     * @param object  the object whose keys to return
     * @return        array of object keys, as strings
     */
    function keys(object)
    {
        var keys = [];
        for (var k in object) {
            keys.push(k);
        }
        return keys;
    }
   
    var rollupManager;
    // Create Map
    var uiMap = function() {    

        //******************************************************************************
// Globals, including constants

        var UI_GLOBAL = {
            UI_PREFIX: 'ui'
            , XHTML_DOCTYPE: '<!DOCTYPE html PUBLIC '
                    + '"-//W3C//DTD XHTML 1.0 Strict//EN" '
                    + '"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">'
            , XHTML_XMLNS: 'http://www.w3.org/1999/xhtml'
        };

//*****************************************************************************
// Exceptions

        function UIElementException(message)
        {
            this.message = message;
            this.name = 'UIElementException';
        }

        function UIArgumentException(message)
        {
            this.message = message;
            this.name = 'UIArgumentException';
        }

        function PagesetException(message)
        {
            this.message = message;
            this.name = 'PagesetException';
        }

        function UISpecifierException(message)
        {
            this.message = message;
            this.name = 'UISpecifierException';
        }

        function CommandMatcherException(message)
        {
            this.message = message;
            this.name = 'CommandMatcherException';
        }

//*****************************************************************************
// UI-Element core

        /**
         * The UIElement object. This has been crafted along with UIMap to make
         * specifying UI elements using JSON as simple as possible. Object construction
         * will fail if 1) a proper name isn't provided, 2) a faulty args argument is
         * given, or 3) getLocator() returns undefined for a valid permutation of
         * default argument values. See ui-doc.html for the documentation on the
         * builder syntax.
         *
         * @param uiElementShorthand  an object whose contents conform to the
         *                            UI-Element builder syntax.
         *
         * @return  a new UIElement object
         * @throws  UIElementException
         */
        function UIElement(uiElementShorthand)
        {
            // a shorthand object might look like:
            //
            // {
            //     name: 'topic'
            //     , description: 'sidebar links to topic categories'
            //     , args: [
            //         {
            //             name: 'name'
            //             , description: 'the name of the topic'
            //             , defaultValues: topLevelTopics
            //         }
            //     ]
            //     , getLocator: function(args) {
            //         return this._listXPath +
            //             "/a[text()=" + args.name.quoteForXPath() + "]";
            //     }
            //     , getGenericLocator: function() {
            //         return this._listXPath + '/a';
            //     }
            //     // maintain testcases for getLocator()
            //     , testcase1: {
            //         // defaultValues used if args not specified
            //         args: { name: 'foo' }
            //         , xhtml: '<div id="topiclist">'
            //             + '<ul><li><a expected-result="1">foo</a></li></ul>'
            //             + '</div>'
            //     }
            //     // set a local element variable
            //     , _listXPath: "//div[@id='topiclist']/ul/li"
            // }
            //
            // name cannot be null or an empty string. Enforce the same requirement for
            // the description.

            /**
             * Recursively returns all permutations of argument-value pairs, given
             * a list of argument definitions. Each argument definition will have
             * a set of default values to use in generating said pairs. If an argument
             * has no default values defined, it will not be included among the
             * permutations.
             *
             * @param args        a list of UIArguments
             * @param inDocument  the document object to pass to the getDefaultValues()
             *                    method of each argument.
             *
             * @return  a list of associative arrays containing key value pairs
             */
            this.permuteArgs = function(args, inDocument) {
                if (args.length == 0) {
                    return [];
                }

                var permutations = [];
                var arg = args[0];
                var remainingArgs = args.slice(1);
                var subsequentPermutations = this.permuteArgs(remainingArgs,
                        inDocument);
                var defaultValues = arg.getDefaultValues(inDocument);

                // skip arguments for which no default values are defined. If the
                // argument is a required one, then no permutations are possible.
                if (defaultValues.length == 0) {
                    if (arg.required) {
                        return [];
                    }
                    else {
                        return subsequentPermutations;
                    }
                }

                for (var i = 0; i < defaultValues.length; ++i) {
                    var value = defaultValues[i];
                    var permutation;

                    if (subsequentPermutations.length == 0) {
                        permutation = {};
                        permutation[arg.name] = value + "";
                        permutations.push(permutation);
                    }
                    else {
                        for (var j = 0; j < subsequentPermutations.length; ++j) {
                            permutation = clone(subsequentPermutations[j]);
                            permutation[arg.name] = value + "";
                            permutations.push(permutation);
                        }
                    }
                }

                return permutations;
            }



            /**
             * Returns a list of all testcases for this UIElement.
             */
            this.getTestcases = function()
            {
                return this.testcases;
            }



            /**
             * Run all unit tests, stopping at the first failure, if any. Return true
             * if no failures encountered, false otherwise. See the following thread
             * regarding use of getElementById() on XML documents created by parsing
             * text via the DOMParser:
             *
             * http://groups.google.com/group/comp.lang.javascript/browse_thread/thread/2b1b82b3c53a1282/
             */
            this.test = function()
            {
                var parser = new DOMParser();
                var testcases = this.getTestcases();
                testcaseLoop: for (var i = 0; i < testcases.length; ++i) {
                    var testcase = testcases[i];
                    var xhtml = UI_GLOBAL.XHTML_DOCTYPE + '<html xmlns="'
                            + UI_GLOBAL.XHTML_XMLNS + '">' + testcase.xhtml + '</html>';
                    var doc = parser.parseFromString(xhtml, "text/xml");
                    if (doc.firstChild.nodeName == 'parsererror') {
                        safe_alert('Error parsing XHTML in testcase "' + testcase.name
                                + '" for UI element "' + this.name + '": ' + "\n"
                                + doc.firstChild.firstChild.nodeValue);
                    }

                    // we're no longer using the default locators when testing, because
                    // args is now required
                    var locator = parse_locator(this.getLocator(testcase.args));
                    var results;

                    if (locator.type == 'xpath' || (locator.type == 'implicit' &&
                            locator.string.substring(0, 2) == '//')) {
                        // try using the javascript xpath engine to avoid namespace
                        // issues. The xpath does have to be lowercase however, it
                        // seems. 
                        results = eval_xpath(locator.string, doc,
                                {allowNativeXpath: false, returnOnFirstMatch: true});
                    }
                    else {
                        // piece the locator back together
                        locator = (locator.type == 'implicit')
                                ? locator.string
                                : locator.type + '=' + locator.string;
                        results = eval_locator(locator, doc);
                    }

                    if (results.length && results[0].hasAttribute('expected-result')) {
                        continue testcaseLoop;
                    }

                    // testcase failed
                    if (is_IDE()) {
                        var msg = 'Testcase "' + testcase.name
                                + '" failed for UI element "' + this.name + '":';
                        if (!results.length) {
                            msg += '\n"' + (locator.string || locator) + '" did not match any elements!';
                        }
                        else {
                            msg += '\n' + results[0] + ' was not the expected result!';
                        }
                        safe_alert(msg);
                    }
                    return false;
                }
                return true;
            };



            /**
             * Creates a set of locators using permutations of default values for
             * arguments used in the locator construction. The set is returned as an
             * object mapping locators to key-value arguments objects containing the
             * values passed to getLocator() to create the locator.
             *
             * @param opt_inDocument (optional) the document object of the "current"
             *                       page when this method is invoked. Some arguments
             *                       may have default value lists that are calculated
             *                       based on the contents of the page.
             *
             * @return  a list of locator strings
             * @throws  UIElementException
             */
            this.getDefaultLocators = function(opt_inDocument) {
                var defaultLocators = {};
                if (this.args.length == 0) {
                    defaultLocators[this.getLocator({})] = {};
                }
                else {
                    var permutations = this.permuteArgs(this.args, opt_inDocument);
                    if (permutations.length != 0) {
                        for (var i = 0; i < permutations.length; ++i) {
                            var args = permutations[i];
                            var locator = this.getLocator(args);
                            if (!locator) {
                                throw new UIElementException('Error in UIElement(): '
                                        + 'no getLocator return value for element "' + name
                                        + '"');
                            }
                            defaultLocators[locator] = args;
                        }
                    }
                    else {
                        // try using no arguments. Parse the locator to make sure it's
                        // really good. If it doesn't work, fine.
                        try {
                            var locator = this.getLocator();
                            parse_locator(locator);
                            defaultLocators[locator] = {};
                        }
                        catch (e) {
                            safe_log('debug', e.message);
                        }
                    }
                }
                return defaultLocators;
            };



            /**
             * Validate the structure of the shorthand notation this object is being
             * initialized with. Throws an exception if there's a validation error.
             *
             * @param uiElementShorthand
             *
             * @throws  UIElementException
             */
            this.validate = function(uiElementShorthand)
            {
                var msg = "UIElement validation error:\n" + print_r(uiElementShorthand);
                if (!uiElementShorthand.name) {
                    throw new UIElementException(msg + 'no name specified!');
                }
                if (!uiElementShorthand.description) {
                    throw new UIElementException(msg + 'no description specified!');
                }
                if (!uiElementShorthand.locator
                        && !uiElementShorthand.getLocator
                        && !uiElementShorthand.xpath
                        && !uiElementShorthand.getXPath) {
                    throw new UIElementException(msg + 'no locator specified!');
                }
            };



            this.init = function(uiElementShorthand)
            {
                this.validate(uiElementShorthand);

                this.name = uiElementShorthand.name;
                this.description = uiElementShorthand.description;

                // construct a new getLocator() method based on the locator property,
                // or use the provided function. We're deprecating the xpath property
                // and getXPath() function, but still allow for them for backwards
                // compatability.
                if (uiElementShorthand.locator) {
                    this.getLocator = function(args) {
                        return uiElementShorthand.locator;
                    };
                }
                else if (uiElementShorthand.getLocator) {
                    this.getLocator = uiElementShorthand.getLocator;
                }
                else if (uiElementShorthand.xpath) {
                    this.getLocator = function(args) {
                        return uiElementShorthand.xpath;
                    };
                }
                else {
                    this.getLocator = uiElementShorthand.getXPath;
                }

                if (uiElementShorthand.genericLocator) {
                    this.getGenericLocator = function() {
                        return uiElementShorthand.genericLocator;
                    };
                }
                else if (uiElementShorthand.getGenericLocator) {
                    this.getGenericLocator = uiElementShorthand.getGenericLocator;
                }

                if (uiElementShorthand.getOffsetLocator) {
                    this.getOffsetLocator = uiElementShorthand.getOffsetLocator;
                }

                // get the testcases and local variables
                this.testcases = [];
                var localVars = {};
                for (var attr in uiElementShorthand) {
                    if (attr.match(/^testcase/)) {
                        var testcase = uiElementShorthand[attr];
                        if (uiElementShorthand.args &&
                                uiElementShorthand.args.length && !testcase.args) {
                            safe_alert('No args defined in ' + attr + ' for UI element '
                                    + this.name + '! Skipping testcase.');
                            continue;
                        }
                        testcase.name = attr;
                        this.testcases.push(testcase);
                    }
                    else if (attr.match(/^_/)) {
                        this[attr] = uiElementShorthand[attr];
                        localVars[attr] = uiElementShorthand[attr];
                    }
                }

                // create the arguments
                this.args = []
                this.argsOrder = [];
                if (uiElementShorthand.args) {
                    for (var i = 0; i < uiElementShorthand.args.length; ++i) {
                        var arg = new UIArgument(uiElementShorthand.args[i], localVars);
                        this.args.push(arg);
                        this.argsOrder.push(arg.name);

                        // if an exception is thrown when invoking getDefaultValues()
                        // with no parameters passed in, assume the method requires an
                        // inDocument parameter, and thus may only be invoked at run
                        // time. Mark the UI element object accordingly.
                        try {
                            arg.getDefaultValues();
                        }
                        catch (e) {
                            this.isDefaultLocatorConstructionDeferred = true;
                        }
                    }

                }

                if (!this.isDefaultLocatorConstructionDeferred) {
                    this.defaultLocators = this.getDefaultLocators();
                }
            };



            this.init(uiElementShorthand);
        }

// hang this off the UIElement "namespace". This is a composite strategy.
        UIElement.defaultOffsetLocatorStrategy = function(locatedElement, pageElement) {
            var strategies = [
                UIElement.linkXPathOffsetLocatorStrategy
                        , UIElement.preferredAttributeXPathOffsetLocatorStrategy
                        , UIElement.simpleXPathOffsetLocatorStrategy
            ];

            for (var i = 0; i < strategies.length; ++i) {
                var strategy = strategies[i];
                var offsetLocator = strategy(locatedElement, pageElement);

                if (offsetLocator) {
                    return offsetLocator;
                }
            }

            return null;
        };

        UIElement.simpleXPathOffsetLocatorStrategy = function(locatedElement,
                pageElement)
        {
            if (is_ancestor(locatedElement, pageElement)) {
                var xpath = "";
                var recorder = Recorder.get(locatedElement.ownerDocument.defaultView);
                var locatorBuilders = recorder.locatorBuilders;
                var currentNode = pageElement;

                while (currentNode != null && currentNode != locatedElement) {
                    xpath = locatorBuilders.relativeXPathFromParent(currentNode)
                            + xpath;
                    currentNode = currentNode.parentNode;
                }

                var results = eval_xpath(xpath, locatedElement.ownerDocument,
                        {contextNode: locatedElement});

                if (results.length > 0 && results[0] == pageElement) {
                    return xpath;
                }
            }

            return null;
        };

        UIElement.linkXPathOffsetLocatorStrategy = function(locatedElement, pageElement)
        {
            if (pageElement.nodeName == 'A' && is_ancestor(locatedElement, pageElement))
            {
                var text = pageElement.textContent
                        .replace(/^\s+/, "")
                        .replace(/\s+$/, "");

                if (text) {
                    var xpath = '/descendant::a[normalize-space()='
                            + text.quoteForXPath() + ']';

                    var results = eval_xpath(xpath, locatedElement.ownerDocument,
                            {contextNode: locatedElement});

                    if (results.length > 0 && results[0] == pageElement) {
                        return xpath;
                    }
                }
            }

            return null;
        };

// compare to the "xpath:attributes" locator strategy defined in the IDE source
        UIElement.preferredAttributeXPathOffsetLocatorStrategy =
                function(locatedElement, pageElement)
                {
                    // this is an ordered listing of single attributes
                    var preferredAttributes = [
                        'name'
                                , 'value'
                                , 'type'
                                , 'action'
                                , 'alt'
                                , 'title'
                                , 'class'
                                , 'src'
                                , 'href'
                                , 'onclick'
                    ];

                    if (is_ancestor(locatedElement, pageElement)) {
                        var xpathBase = '/descendant::' + pageElement.nodeName.toLowerCase();

                        for (var i = 0; i < preferredAttributes.length; ++i) {
                            var name = preferredAttributes[i];
                            var value = pageElement.getAttribute(name);

                            if (value) {
                                var xpath = xpathBase + '[@' + name + '='
                                        + value.quoteForXPath() + ']';

                                var results = eval_xpath(xpath, locatedElement.ownerDocument,
                                        {contextNode: locatedElement});

                                if (results.length > 0 && results[0] == pageElement) {
                                    return xpath;
                                }
                            }
                        }
                    }

                    return null;
                };



        /**
         * Constructs a UIArgument. This is mostly for checking that the values are
         * valid.
         *
         * @param uiArgumentShorthand
         * @param localVars
         *
         * @throws  UIArgumentException
         */
        function UIArgument(uiArgumentShorthand, localVars)
        {
            /**
             * @param uiArgumentShorthand
             *
             * @throws  UIArgumentException
             */
            this.validate = function(uiArgumentShorthand)
            {
                var msg = "UIArgument validation error:\n"
                        + print_r(uiArgumentShorthand);

                // try really hard to throw an exception!
                if (!uiArgumentShorthand.name) {
                    throw new UIArgumentException(msg + 'no name specified!');
                }
                if (!uiArgumentShorthand.description) {
                    throw new UIArgumentException(msg + 'no description specified!');
                }
                if (!uiArgumentShorthand.defaultValues &&
                        !uiArgumentShorthand.getDefaultValues) {
                    throw new UIArgumentException(msg + 'no default values specified!');
                }
            };



            /**
             * @param uiArgumentShorthand
             * @param localVars            a list of local variables
             */
            this.init = function(uiArgumentShorthand, localVars)
            {
                this.validate(uiArgumentShorthand);

                this.name = uiArgumentShorthand.name;
                this.description = uiArgumentShorthand.description;
                this.required = uiArgumentShorthand.required || false;

                if (uiArgumentShorthand.defaultValues) {
                    var defaultValues = uiArgumentShorthand.defaultValues;
                    this.getDefaultValues =
                            function() {
                                return defaultValues;
                            }
                }
                else {
                    this.getDefaultValues = uiArgumentShorthand.getDefaultValues;
                }

                for (var name in localVars) {
                    this[name] = localVars[name];
                }
            }



            this.init(uiArgumentShorthand, localVars);
        }



        /**
         * The UISpecifier constructor is overloaded. If less than three arguments are
         * provided, the first argument will be considered a UI specifier string, and
         * will be split out accordingly. Otherwise, the first argument will be
         * considered the path.
         *
         * @param uiSpecifierStringOrPagesetName  a UI specifier string, or the pageset
         *                                        name of the UI specifier
         * @param elementName  the name of the element
         * @param args         an object associating keys to values
         *
         * @return  new UISpecifier object
         */
        function UISpecifier(uiSpecifierStringOrPagesetName, elementName, args)
        {
            /**
             * Initializes this object from a UI specifier string of the form:
             *
             *     pagesetName::elementName(arg1=value1, arg2=value2, ...)
             *
             * into its component parts, and returns them as an object.
             *
             * @return  an object containing the components of the UI specifier
             * @throws  UISpecifierException
             */
            this._initFromUISpecifierString = function(uiSpecifierString) {
                var matches = /^(.*)::([^\(]+)\((.*)\)$/.exec(uiSpecifierString);
                if (matches == null) {
                    throw new UISpecifierException('Error in '
                            + 'UISpecifier._initFromUISpecifierString(): "'
                            + this.string + '" is not a valid UI specifier string');
                }
                this.pagesetName = matches[1];
                this.elementName = matches[2];
                this.args = (matches[3]) ? parse_kwargs(matches[3]) : {};
            };



            /**
             * Override the toString() method to return the UI specifier string when
             * evaluated in a string context. Combines the UI specifier components into
             * a canonical UI specifier string and returns it.
             *
             * @return   a UI specifier string
             */
            this.toString = function() {
                // empty string is acceptable for the path, but it must be defined
                if (this.pagesetName == undefined) {
                    throw new UISpecifierException('Error in UISpecifier.toString(): "'
                            + this.pagesetName + '" is not a valid UI specifier pageset '
                            + 'name');
                }
                if (!this.elementName) {
                    throw new UISpecifierException('Error in UISpecifier.unparse(): "'
                            + this.elementName + '" is not a valid UI specifier element '
                            + 'name');
                }
                if (!this.args) {
                    throw new UISpecifierException('Error in UISpecifier.unparse(): "'
                            + this.args + '" are not valid UI specifier args');
                }

                uiElement = UIMap.getInstance()
                        .getUIElement(this.pagesetName, this.elementName);
                if (uiElement != null) {
                    var kwargs = to_kwargs(this.args, uiElement.argsOrder);
                }
                else {
                    // probably under unit test
                    var kwargs = to_kwargs(this.args);
                }

                return this.pagesetName + '::' + this.elementName + '(' + kwargs + ')';
            };

            // construct the object
            if (arguments.length < 2) {
                this._initFromUISpecifierString(uiSpecifierStringOrPagesetName);
            }
            else {
                this.pagesetName = uiSpecifierStringOrPagesetName;
                this.elementName = elementName;
                this.args = (args) ? clone(args) : {};
            }
        }



        function Pageset(pagesetShorthand)
        {
            /**
             * Returns true if the page is included in this pageset, false otherwise.
             * The page is specified by a document object.
             *
             * @param inDocument  the document object representing the page
             */
            this.contains = function(inDocument)
            {
                var urlParts = parseUri(unescape(inDocument.location.href));
                var path = urlParts.path
                        .replace(/^\//, "")
                        .replace(/\/$/, "");
                if (!this.pathRegexp.test(path)) {
                    return false;
                }
                for (var paramName in this.paramRegexps) {
                    var paramRegexp = this.paramRegexps[paramName];
                    if (!paramRegexp.test(urlParts.queryKey[paramName])) {
                        return false;
                    }
                }
                if (!this.pageContent(inDocument)) {
                    return false;
                }

                return true;
            }



            this.getUIElements = function()
            {
                var uiElements = [];
                for (var uiElementName in this.uiElements) {
                    uiElements.push(this.uiElements[uiElementName]);
                }
                return uiElements;
            };



            /**
             * Returns a list of UI specifier string stubs representing all UI elements
             * for this pageset. Stubs contain all required arguments, but leave
             * argument values blank. Each element stub is paired with the element's
             * description.
             *
             * @return  a list of UI specifier string stubs
             */
            this.getUISpecifierStringStubs = function()
            {
                var stubs = [];
                for (var name in this.uiElements) {
                    var uiElement = this.uiElements[name];
                    var args = {};
                    for (var i = 0; i < uiElement.args.length; ++i) {
                        args[uiElement.args[i].name] = '';
                    }
                    var uiSpecifier = new UISpecifier(this.name, uiElement.name, args);
                    stubs.push([
                        UI_GLOBAL.UI_PREFIX + '=' + uiSpecifier.toString()
                                , uiElement.description
                    ]);
                }
                return stubs;
            }



            /**
             * Throws an exception on validation failure.
             */
            this._validate = function(pagesetShorthand)
            {
                var msg = "Pageset validation error:\n"
                        + print_r(pagesetShorthand);
                if (!pagesetShorthand.name) {
                    throw new PagesetException(msg + 'no name specified!');
                }
                if (!pagesetShorthand.description) {
                    throw new PagesetException(msg + 'no description specified!');
                }
                if (!pagesetShorthand.paths &&
                        !pagesetShorthand.pathRegexp &&
                        !pagesetShorthand.pageContent) {
                    throw new PagesetException(msg
                            + 'no path, pathRegexp, or pageContent specified!');
                }
            };



            this.init = function(pagesetShorthand)
            {
                this._validate(pagesetShorthand);

                this.name = pagesetShorthand.name;
                this.description = pagesetShorthand.description;

                var pathPrefixRegexp = pagesetShorthand.pathPrefix
                        ? RegExp.escape(pagesetShorthand.pathPrefix) : "";
                var pathRegexp = '^' + pathPrefixRegexp;

                if (pagesetShorthand.paths != undefined) {
                    pathRegexp += '(?:';
                    for (var i = 0; i < pagesetShorthand.paths.length; ++i) {
                        if (i > 0) {
                            pathRegexp += '|';
                        }
                        pathRegexp += RegExp.escape(pagesetShorthand.paths[i]);
                    }
                    pathRegexp += ')$';
                }
                else if (pagesetShorthand.pathRegexp) {
                    pathRegexp += '(?:' + pagesetShorthand.pathRegexp + ')$';
                }

                this.pathRegexp = new RegExp(pathRegexp);
                this.paramRegexps = {};
                for (var paramName in pagesetShorthand.paramRegexps) {
                    this.paramRegexps[paramName] =
                            new RegExp(pagesetShorthand.paramRegexps[paramName]);
                }
                this.pageContent = pagesetShorthand.pageContent ||
                        function() {
                            return true;
                        };
                this.uiElements = {};
            };



            this.init(pagesetShorthand);
        }



        /**
         * Construct the UI map object, and return it. Once the object is instantiated,
         * it binds to a global variable and will not leave scope.
         *
         * @return  new UIMap object
         */
        function UIMap()
        {
            // the singleton pattern, split into two parts so that "new" can still
            // be used, in addition to "getInstance()"
            UIMap.self = this;

            // need to attach variables directly to the Editor object in order for them
            // to be in scope for Editor methods
            if (is_IDE()) {
                Editor.uiMap = this;
                Editor.UI_PREFIX = UI_GLOBAL.UI_PREFIX;
            }

            this.pagesets = new Object();



            /**
             * pageset[pagesetName]
             *   regexp
             *   elements[elementName]
             *     UIElement
             */
            this.addPageset = function(pagesetShorthand)
            {
                try {
                    var pageset = new Pageset(pagesetShorthand);
                }
                catch (e) {
                    safe_alert("Could not create pageset from shorthand:\n"
                            + print_r(pagesetShorthand) + "\n" + e.message);
                    return false;
                }

                if (this.pagesets[pageset.name]) {
                    safe_alert('Could not add pageset "' + pageset.name
                            + '": a pageset with that name already exists!');
                    return false;
                }

                this.pagesets[pageset.name] = pageset;
                return true;
            };



            /**
             * @param pagesetName
             * @param uiElementShorthand  a representation of a UIElement object in
             *                            shorthand JSON.
             */
            this.addElement = function(pagesetName, uiElementShorthand)
            {
                try {
                    var uiElement = new UIElement(uiElementShorthand);
                }
                catch (e) {
                    safe_alert("Could not create UI element from shorthand:\n"
                            + print_r(uiElementShorthand) + "\n" + e.message);
                    return false;
                }

                // run the element's unit tests only for the IDE, and only when the
                // IDE is starting. Make a rough guess as to the latter condition.
                if (is_IDE() && !editor.selDebugger && !uiElement.test()) {
                    safe_alert('Could not add UI element "' + uiElement.name
                            + '": failed testcases!');
                    return false;
                }

                try {
                    this.pagesets[pagesetName].uiElements[uiElement.name] = uiElement;
                }
                catch (e) {
                    safe_alert("Could not add UI element '" + uiElement.name
                            + "' to pageset '" + pagesetName + "':\n" + e.message);
                    return false;
                }

                return true;
            };



            /**
             * Returns the pageset for a given UI specifier string.
             *
             * @param uiSpecifierString
             * @return  a pageset object
             */
            this.getPageset = function(uiSpecifierString)
            {
                try {
                    var uiSpecifier = new UISpecifier(uiSpecifierString);
                    return this.pagesets[uiSpecifier.pagesetName];
                }
                catch (e) {
                    return null;
                }
            }



            /**
             * Returns the UIElement that a UISpecifierString or pageset and element
             * pair refer to.
             *
             * @param pagesetNameOrUISpecifierString
             * @return  a UIElement, or null if none is found associated with
             *          uiSpecifierString
             */
            this.getUIElement = function(pagesetNameOrUISpecifierString, uiElementName)
            {
                var pagesetName = pagesetNameOrUISpecifierString;
                if (arguments.length == 1) {
                    var uiSpecifierString = pagesetNameOrUISpecifierString;
                    try {
                        var uiSpecifier = new UISpecifier(uiSpecifierString);
                        pagesetName = uiSpecifier.pagesetName;
                        var uiElementName = uiSpecifier.elementName;
                    }
                    catch (e) {
                        return null;
                    }
                }
                try {
                    return this.pagesets[pagesetName].uiElements[uiElementName];
                }
                catch (e) {
                    return null;
                }
            };



            /**
             * Returns a list of pagesets that "contains" the provided page,
             * represented as a document object. Containership is defined by the
             * Pageset object's contain() method.
             *
             * @param inDocument  the page to get pagesets for
             * @return            a list of pagesets
             */
            this.getPagesetsForPage = function(inDocument)
            {
                var pagesets = [];
                for (var pagesetName in this.pagesets) {
                    var pageset = this.pagesets[pagesetName];
                    if (pageset.contains(inDocument)) {
                        pagesets.push(pageset);
                    }
                }
                return pagesets;
            };



            /**
             * Returns a list of all pagesets.
             *
             * @return  a list of pagesets
             */
            this.getPagesets = function()
            {
                var pagesets = [];
                for (var pagesetName in this.pagesets) {
                    pagesets.push(this.pagesets[pagesetName]);
                }
                return pagesets;
            };



            /**
             * Returns a list of elements on a page that a given UI specifier string,
             * maps to. If no elements are mapped to, returns an empty list..
             *
             * @param   uiSpecifierString  a String that specifies a UI element with
             *                             attendant argument values
             * @param   inDocument         the document object the specified UI element
             *                             appears in
             * @return                     a potentially-empty list of elements
             *                             specified by uiSpecifierString
             */
            this.getPageElements = function(uiSpecifierString, inDocument)
            {
                var locator = this.getLocator(uiSpecifierString);
                var results = locator ? eval_locator(locator, inDocument) : [];
                return results;
            };



            /**
             * Returns the locator string that a given UI specifier string maps to, or
             * null if it cannot be mapped.
             *
             * @param uiSpecifierString
             */
            this.getLocator = function(uiSpecifierString)
            {
                try {
                    var uiSpecifier = new UISpecifier(uiSpecifierString);
                }
                catch (e) {
                    safe_alert('Could not create UISpecifier for string "'
                            + uiSpecifierString + '": ' + e.message);
                    return null;
                }

                var uiElement = this.getUIElement(uiSpecifier.pagesetName,
                        uiSpecifier.elementName);
                try {
                    return uiElement.getLocator(uiSpecifier.args);
                }
                catch (e) {
                    return null;
                }
            }



            /**
             * Finds and returns a UI specifier string given an element and the page
             * that it appears on.
             *
             * @param pageElement  the document element to map to a UI specifier
             * @param inDocument   the document the element appears in
             * @return             a UI specifier string, or false if one cannot be
             *                     constructed
             */
            this.getUISpecifierString = function(pageElement, inDocument)
            {
                var is_fuzzy_match =
                        BrowserBot.prototype.locateElementByUIElement.is_fuzzy_match;
                var pagesets = this.getPagesetsForPage(inDocument);

                for (var i = 0; i < pagesets.length; ++i) {
                    var pageset = pagesets[i];
                    var uiElements = pageset.getUIElements();

                    for (var j = 0; j < uiElements.length; ++j) {
                        var uiElement = uiElements[j];

                        // first test against the generic locator, if there is one.
                        // This should net some performance benefit when recording on
                        // more complicated pages.
                        if (uiElement.getGenericLocator) {
                            var passedTest = false;
                            var results =
                                    eval_locator(uiElement.getGenericLocator(), inDocument);
                            for (var i = 0; i < results.length; ++i) {
                                if (results[i] == pageElement) {
                                    passedTest = true;
                                    break;
                                }
                            }
                            if (!passedTest) {
                                continue;
                            }
                        }

                        var defaultLocators;
                        if (uiElement.isDefaultLocatorConstructionDeferred) {
                            defaultLocators = uiElement.getDefaultLocators(inDocument);
                        }
                        else {
                            defaultLocators = uiElement.defaultLocators;
                        }

                        //safe_alert(print_r(uiElement.defaultLocators));
                        for (var locator in defaultLocators) {
                            var locatedElements = eval_locator(locator, inDocument);
                            if (locatedElements.length) {
                                var locatedElement = locatedElements[0];
                            }
                            else {
                                continue;
                            }

                            // use a heuristic to determine whether the element
                            // specified is the "same" as the element we're matching
                            if (is_fuzzy_match) {
                                if (is_fuzzy_match(locatedElement, pageElement)) {
                                    return UI_GLOBAL.UI_PREFIX + '=' +
                                            new UISpecifier(pageset.name, uiElement.name,
                                                    defaultLocators[locator]);
                                }
                            }
                            else {
                                if (locatedElement == pageElement) {
                                    return UI_GLOBAL.UI_PREFIX + '=' +
                                            new UISpecifier(pageset.name, uiElement.name,
                                                    defaultLocators[locator]);
                                }
                            }

                            // ok, matching the element failed. See if an offset
                            // locator can complete the match.
                            if (uiElement.getOffsetLocator) {
                                for (var k = 0; k < locatedElements.length; ++k) {
                                    var offsetLocator = uiElement
                                            .getOffsetLocator(locatedElements[k], pageElement);
                                    if (offsetLocator) {
                                        return UI_GLOBAL.UI_PREFIX + '=' +
                                                new UISpecifier(pageset.name,
                                                        uiElement.name,
                                                        defaultLocators[locator])
                                                + '->' + offsetLocator;
                                    }
                                }
                            }
                        }
                    }
                }
                return false;
            };



            /**
             * Returns a sorted list of UI specifier string stubs representing possible
             * UI elements for all pagesets, paired the their descriptions. Stubs
             * contain all required arguments, but leave argument values blank.
             *
             * @return  a list of UI specifier string stubs
             */
            this.getUISpecifierStringStubs = function() {
                var stubs = [];
                var pagesets = this.getPagesets();
                for (var i = 0; i < pagesets.length; ++i) {
                    stubs = stubs.concat(pagesets[i].getUISpecifierStringStubs());
                }
                stubs.sort(function(a, b) {
                    if (a[0] < b[0]) {
                        return -1;
                    }
                    return a[0] == b[0] ? 0 : 1;
                });
                return stubs;
            }
        }

        UIMap.getInstance = function() {
            return (UIMap.self == null) ? new UIMap() : UIMap.self;
        }

//******************************************************************************
// Rollups

        /**
         * The Command object isn't available in the Selenium RC. We introduce an
         * object with the identical constructor. In the IDE, this will be redefined,
         * which is just fine.
         *
         * @param command
         * @param target
         * @param value
         */
        if (typeof (Command) == 'undefined') {
            function Command(command, target, value) {
                this.command = command != null ? command : '';
                this.target = target != null ? target : '';
                this.value = value != null ? value : '';
            }
        }



        /**
         * A CommandMatcher object matches commands during the application of a
         * RollupRule. It's specified with a shorthand format, for example:
         *
         *  new CommandMatcher({
         *      command: 'click'
         *      , target: 'ui=allPages::.+'
         *  })
         *
         * which is intended to match click commands whose target is an element in the
         * allPages PageSet. The matching expressions are given as regular expressions;
         * in the example above, the command must be "click"; "clickAndWait" would be
         * acceptable if 'click.*' were used. Here's a more complete example:
         *
         *  new CommandMatcher({
         *      command: 'type'
         *      , target: 'ui=loginPages::username()'
         *      , value: '.+_test'
         *      , updateArgs: function(command, args) {
         *          args.username = command.value;
         *      }
         *  })
         *
         * Here, the command and target are fixed, but there is variability in the 
         * value of the command. When a command matches, the username is saved to the
         * arguments object.
         */
        function CommandMatcher(commandMatcherShorthand)
        {
            /**
             * Ensure the shorthand notation used to initialize the CommandMatcher has
             * all required values.
             *
             * @param commandMatcherShorthand  an object containing information about
             *                                 the CommandMatcher
             */
            this.validate = function(commandMatcherShorthand) {
                var msg = "CommandMatcher validation error:\n"
                        + print_r(commandMatcherShorthand);
                if (!commandMatcherShorthand.command) {
                    throw new CommandMatcherException(msg + 'no command specified!');
                }
                if (!commandMatcherShorthand.target) {
                    throw new CommandMatcherException(msg + 'no target specified!');
                }
                if (commandMatcherShorthand.minMatches &&
                        commandMatcherShorthand.maxMatches &&
                        commandMatcherShorthand.minMatches >
                        commandMatcherShorthand.maxMatches) {
                    throw new CommandMatcherException(msg + 'minMatches > maxMatches!');
                }
            };

            /**
             * Initialize this object.
             *
             * @param commandMatcherShorthand  an object containing information used to
             *                                 initialize the CommandMatcher
             */
            this.init = function(commandMatcherShorthand) {
                this.validate(commandMatcherShorthand);

                this.command = commandMatcherShorthand.command;
                this.target = commandMatcherShorthand.target;
                this.value = commandMatcherShorthand.value || null;
                this.minMatches = commandMatcherShorthand.minMatches || 1;
                this.maxMatches = commandMatcherShorthand.maxMatches || 1;
                this.updateArgs = commandMatcherShorthand.updateArgs ||
                        function(command, args) {
                            return args;
                        };
            };

            /**
             * Determines whether a given command matches. Updates args by "reference"
             * and returns true if it does; return false otherwise.
             *
             * @param command  the command to attempt to match
             */
            this.isMatch = function(command) {
                var re = new RegExp('^' + this.command + '$');
                if (!re.test(command.command)) {
                    return false;
                }
                re = new RegExp('^' + this.target + '$');
                if (!re.test(command.target)) {
                    return false;
                }
                if (this.value != null) {
                    re = new RegExp('^' + this.value + '$');
                    if (!re.test(command.value)) {
                        return false;
                    }
                }

                // okay, the command matches
                return true;
            };

            // initialization
            this.init(commandMatcherShorthand);
        }



        function RollupRuleException(message)
        {
            this.message = message;
            this.name = 'RollupRuleException';
        }

        function RollupRule(rollupRuleShorthand)
        {
            /**
             * Ensure the shorthand notation used to initialize the RollupRule has all
             * required values.
             *
             * @param rollupRuleShorthand  an object containing information about the
             *                             RollupRule
             */
            this.validate = function(rollupRuleShorthand) {
                var msg = "RollupRule validation error:\n"
                        + print_r(rollupRuleShorthand);
                if (!rollupRuleShorthand.name) {
                    throw new RollupRuleException(msg + 'no name specified!');
                }
                if (!rollupRuleShorthand.description) {
                    throw new RollupRuleException(msg + 'no description specified!');
                }
                // rollupRuleShorthand.args is optional
                if (!rollupRuleShorthand.commandMatchers &&
                        !rollupRuleShorthand.getRollup) {
                    throw new RollupRuleException(msg
                            + 'no command matchers specified!');
                }
                if (!rollupRuleShorthand.expandedCommands &&
                        !rollupRuleShorthand.getExpandedCommands) {
                    throw new RollupRuleException(msg
                            + 'no expanded commands specified!');
                }

                return true;
            };

            /**
             * Initialize this object.
             *
             * @param rollupRuleShorthand  an object containing information used to
             *                             initialize the RollupRule
             */
            this.init = function(rollupRuleShorthand) {
                this.validate(rollupRuleShorthand);

                this.name = rollupRuleShorthand.name;
                this.description = rollupRuleShorthand.description;
                this.pre = rollupRuleShorthand.pre || '';
                this.post = rollupRuleShorthand.post || '';
                this.alternateCommand = rollupRuleShorthand.alternateCommand;
                this.args = rollupRuleShorthand.args || [];

                if (rollupRuleShorthand.commandMatchers) {
                    // construct the rule from the list of CommandMatchers
                    this.commandMatchers = [];
                    var matchers = rollupRuleShorthand.commandMatchers;
                    for (var i = 0; i < matchers.length; ++i) {
                        if (matchers[i].updateArgs && this.args.length == 0) {
                            // enforce metadata for arguments
                            var msg = "RollupRule validation error:\n"
                                    + print_r(rollupRuleShorthand)
                                    + 'no argument metadata provided!';
                            throw new RollupRuleException(msg);
                        }
                        this.commandMatchers.push(new CommandMatcher(matchers[i]));
                    }

                    // returns false if the rollup doesn't match, or a rollup command
                    // if it does. If returned, the command contains the
                    // replacementIndexes property, which indicates which commands it
                    // substitutes for.
                    this.getRollup = function(commands) {
                        // this is a greedy matching algorithm
                        var replacementIndexes = [];
                        var commandMatcherQueue = this.commandMatchers;
                        var matchCount = 0;
                        var args = {};
                        for (var i = 0, j = 0; i < commandMatcherQueue.length; ) {
                            var matcher = commandMatcherQueue[i];
                            if (j >= commands.length) {
                                // we've run out of commands! If the remaining matchers
                                // do not have minMatches requirements, this is a
                                // match. Otherwise, it's not.
                                if (matcher.minMatches > 0) {
                                    return false;
                                }
                                ++i;
                                matchCount = 0; // unnecessary, but let's be consistent
                            }
                            else {
                                if (matcher.isMatch(commands[j])) {
                                    ++matchCount;
                                    if (matchCount == matcher.maxMatches) {
                                        // exhausted this matcher's matches ... move on
                                        // to next matcher
                                        ++i;
                                        matchCount = 0;
                                    }
                                    args = matcher.updateArgs(commands[j], args);
                                    replacementIndexes.push(j);
                                    ++j; // move on to next command
                                }
                                else {
                                    //alert(matchCount + ', ' + matcher.minMatches);
                                    if (matchCount < matcher.minMatches) {
                                        return false;
                                    }
                                    // didn't match this time, but we've satisfied the
                                    // requirements already ... move on to next matcher
                                    ++i;
                                    matchCount = 0;
                                    // still gonna look at same command
                                }
                            }
                        }

                        var rollup;
                        if (this.alternateCommand) {
                            rollup = new Command(this.alternateCommand,
                                    commands[0].target, commands[0].value);
                        }
                        else {
                            rollup = new Command('rollup', this.name);
                            rollup.value = to_kwargs(args);
                        }
                        rollup.replacementIndexes = replacementIndexes;
                        return rollup;
                    };
                }
                else {
                    this.getRollup = function(commands) {
                        var result = rollupRuleShorthand.getRollup(commands);
                        if (result) {
                            var rollup = new Command(
                                    result.command
                                    , result.target
                                    , result.value
                                    );
                            rollup.replacementIndexes = result.replacementIndexes;
                            return rollup;
                        }
                        return false;
                    };
                }

                this.getExpandedCommands = function(kwargs) {
                    var commands = [];
                    var expandedCommands = (rollupRuleShorthand.expandedCommands
                            ? rollupRuleShorthand.expandedCommands
                            : rollupRuleShorthand.getExpandedCommands(
                                    parse_kwargs(kwargs)));
                    for (var i = 0; i < expandedCommands.length; ++i) {
                        var command = expandedCommands[i];
                        commands.push(new Command(
                                command.command
                                , command.target
                                , command.value
                                ));
                    }
                    return commands;
                };
            };

            this.init(rollupRuleShorthand);
        }



        /**
         *
         */
        function RollupManager()
        {
            // singleton pattern
            RollupManager.self = this;

            this.init = function()
            {
                this.rollupRules = {};
                if (is_IDE()) {
                    Editor.rollupManager = this;
                }
            };

            /**
             * Adds a new RollupRule to the repository. Returns true on success, or
             * false if the rule couldn't be added.
             *
             * @param rollupRuleShorthand  shorthand JSON specification of the new
             *                             RollupRule, possibly including CommandMatcher
             *                             shorthand too.
             * @return                     true if the rule was added successfully,
             *                             false otherwise.
             */
            this.addRollupRule = function(rollupRuleShorthand)
            {
                try {
                    var rule = new RollupRule(rollupRuleShorthand);
                    this.rollupRules[rule.name] = rule;
                }
                catch (e) {
                    smart_alert("Could not create RollupRule from shorthand:\n\n"
                            + e.message);
                    return false;
                }
                return true;
            };

            /**
             * Returns a RollupRule by name.
             *
             * @param rollupName  the name of the rule to fetch
             * @return            the RollupRule, or null if it isn't found.
             */
            this.getRollupRule = function(rollupName)
            {
                return (this.rollupRules[rollupName] || null);
            };

            /**
             * Returns a list of name-description pairs for use in populating the
             * auto-populated target dropdown in the IDE. Rules that have an alternate
             * command defined are not included in the list, as they are not bona-fide
             * rollups.
             *
             * @return  a list of name-description pairs
             */
            this.getRollupRulesForDropdown = function()
            {
                var targets = [];
                var names = keys(this.rollupRules).sort();
                for (var i = 0; i < names.length; ++i) {
                    var name = names[i];
                    if (this.rollupRules[name].alternateCommand) {
                        continue;
                    }
                    targets.push([name, this.rollupRules[name].description]);
                }
                return targets;
            };

            /**
             * Applies all rules to the current editor commands, asking the user in
             * each case if it's okay to perform the replacement. The rules are applied
             * repeatedly until there are no more matches. The algorithm should
             * remember when the user has declined a replacement, and not ask to do it
             * again.
             *
             * @return  the list of commands with rollup replacements performed
             */
            this.applyRollupRules = function()
            {
                var commands = editor.getTestCase().commands;
                var blacklistedRollups = {};

                // so long as rollups were performed, we need to keep iterating through
                // the commands starting at the beginning, because further rollups may
                // potentially be applied on the newly created ones.
                while (true) {
                    var performedRollup = false;
                    for (var i = 0; i < commands.length; ++i) {
                        // iterate through commands
                        for (var rollupName in this.rollupRules) {
                            var rule = this.rollupRules[rollupName];
                            var rollup = rule.getRollup(commands.slice(i));
                            if (rollup) {
                                // since we passed in a sliced version of the commands
                                // array to the getRollup() method, we need to re-add 
                                // the offset to the replacementIndexes
                                var k = 0;
                                for (; k < rollup.replacementIndexes.length; ++k) {
                                    rollup.replacementIndexes[k] += i;
                                }

                                // build the confirmation message
                                var msg = "Perform the following command rollup?\n\n";
                                for (k = 0; k < rollup.replacementIndexes.length; ++k) {
                                    var replacementIndex = rollup.replacementIndexes[k];
                                    var command = commands[replacementIndex];
                                    msg += '[' + replacementIndex + ']: ';
                                    msg += command + "\n";
                                }
                                msg += "\n";
                                msg += rollup;

                                // check against blacklisted rollups
                                if (blacklistedRollups[msg]) {
                                    continue;
                                }

                                // highlight the potentially replaced rows
                                for (k = 0; k < commands.length; ++k) {
                                    var command = commands[k];
                                    command.result = '';
                                    if (rollup.replacementIndexes.indexOf(k) != -1) {
                                        command.selectedForReplacement = true;
                                    }
                                    editor.view.rowUpdated(replacementIndex);
                                }

                                // get confirmation from user
                                if (confirm(msg)) {
                                    // perform rollup
                                    var deleteRanges = [];
                                    var replacementIndexes = rollup.replacementIndexes;
                                    for (k = 0; k < replacementIndexes.length; ++k) {
                                        // this is expected to be list of ranges. A
                                        // range has a start, and a list of commands.
                                        // The deletion only checks the length of the
                                        // command list.
                                        deleteRanges.push({
                                            start: replacementIndexes[k]
                                            , commands: [1]
                                        });
                                    }
                                    editor.view.executeAction(new TreeView
                                            .DeleteCommandAction(editor.view, deleteRanges));
                                    editor.view.insertAt(i, rollup);

                                    performedRollup = true;
                                }
                                else {
                                    // cleverly remember not to try this rollup again
                                    blacklistedRollups[msg] = true;
                                }

                                // unhighlight
                                for (k = 0; k < commands.length; ++k) {
                                    commands[k].selectedForReplacement = false;
                                    editor.view.rowUpdated(k);
                                }
                            }
                        }
                    }
                    if (!performedRollup) {
                        break;
                    }
                }
                return commands;
            };

            this.init();
        }

        RollupManager.getInstance = function() {
            return (RollupManager.self == null)
                    ? new RollupManager()
                    : RollupManager.self;
        };

        rollupManager = new RollupManager();

        return new UIMap();
        //rollupManager = new RollupManager();

    }();

    return {
        load: function(filename) {

            fs.readFile(filename, function(err, data) {

                if (err) {
                    throw err;
                }

                //var libarayCall = new Function(data);

                //libarayCall();

                //eval(data);





// sample UI element mapping definition. This is for http://alistapart.com/,
// a particularly well structured site on web design principles.



// in general, the map should capture structural aspects of the system, instead
// of "content". In other words, interactive elements / assertible elements
// that can be counted on to always exist should be defined here. Content -
// for example text or a link that appears in a blog entry - is always liable
// to change, and will not be fun to represent in this way. You probably don't
// want to be testing specific content anyway.

// create the UI mapping object. THIS IS THE MOST IMPORTANT PART - DON'T FORGET
// TO DO THIS! In order for it to come into play, a user extension must
// construct the map in this way.
//var uiMap = new UIMap();




// any values which may appear multiple times can be defined as variables here.
// For example, here we're enumerating a list of top level topics that will be
// used as default argument values for several UI elements. Check out how
// this variable is referenced further down.
                var topics = [
                    'Code',
                    'Content',
                    'Culture',
                    'Design',
                    'Process',
                    'User Science'
                ];

// map subtopics to their parent topics
                var subtopics = {
                    'Browsers': 'Code'
                    , 'CSS': 'Code'
                    , 'Flash': 'Code'
                    , 'HTML and XHTML': 'Code'
                    , 'Scripting': 'Code'
                    , 'Server Side': 'Code'
                    , 'XML': 'Code'
                    , 'Brand Arts': 'Content'
                    , 'Community': 'Content'
                    , 'Writing': 'Content'
                    , 'Industry': 'Culture'
                    , 'Politics and Money': 'Culture'
                    , 'State of the Web': 'Culture'
                    , 'Graphic Design': 'Design'
                    , 'User Interface Design': 'Design'
                    , 'Typography': 'Design'
                    , 'Layout': 'Design'
                    , 'Business': 'Process'
                    , 'Creativity': 'Process'
                    , 'Project Management and Workflow': 'Process'
                    , 'Accessibility': 'User Science'
                    , 'Information Architecture': 'User Science'
                    , 'Usability': 'User Science'
                };



// define UI elements common for all pages. This regular expression does the
// trick. '^' is automatically prepended, and '$' is automatically postpended.
// Please note that because the regular expression is being represented as a
// string, all backslashes must be escaped with an additional backslash. Also
// note that the URL being matched will always have any trailing forward slash
// stripped.
                uiMap.addPageset({
                    name: 'allPages'
                    , description: 'all alistapart.com pages'
                    , pathRegexp: '.*'
                });
                uiMap.addElement('allPages', {
                    name: 'masthead'
                            // the description should be short and to the point, usually no longer than
                            // a single line
                    , description: 'top level image link to site homepage'
                            // make sure the function returns the XPath ... it's easy to leave out the
                            // "return" statement by accident!
                    , locator: "xpath=//*[@id='masthead']/a/img"
                    , testcase1: {
                        xhtml: '<h1 id="masthead"><a><img expected-result="1" /></a></h1>'
                    }
                });
                uiMap.addElement('allPages', {
                    // be VERY CAREFUL to include commas in the correct place. Missing commas
                    // and extra commas can cause lots of headaches when debugging map
                    // definition files!!!
                    name: 'current_issue'
                    , description: 'top level link to issue currently being browsed'
                    , locator: "//div[@id='ish']/a"
                    , testcase1: {
                        xhtml: '<div id="ish"><a expected-result="1"></a></div>'
                    }
                });
                uiMap.addElement('allPages', {
                    name: 'section'
                    , description: 'top level link to articles section'
                    , args: [
                        {
                            name: 'section'
                            , description: 'the name of the section'
                            , defaultValues: [
                                'articles'
                                        , 'topics'
                                        , 'about'
                                        , 'contact'
                                        , 'contribute'
                                        , 'feed'
                            ]
                        }
                    ]
                            // getXPath has been deprecated by getLocator, but verify backward
                            // compatability here
                    , getXPath: function(args) {
                        return "//li[@id=" + args.section.quoteForXPath() + "]/a";
                    }
                    , testcase1: {
                        args: {section: 'feed'}
                        , xhtml: '<ul><li id="feed"><a expected-result="1" /></li></ul>'
                    }
                });
                uiMap.addElement('allPages', {
                    name: 'search_box'
                    , description: 'site search input field'
                            // xpath has been deprecated by locator, but verify backward compatability
                    , xpath: "//input[@id='search']"
                    , testcase1: {
                        xhtml: '<input id="search" expected-result="1" />'
                    }
                });
                uiMap.addElement('allPages', {
                    name: 'search_discussions'
                    , description: 'site search include discussions checkbox'
                    , locator: 'incdisc'
                    , testcase1: {
                        xhtml: '<input id="incdisc" expected-result="1" />'
                    }
                });
                uiMap.addElement('allPages', {
                    name: 'search_submit'
                    , description: 'site search submission button'
                    , locator: 'submit'
                    , testcase1: {
                        xhtml: '<input id="submit" expected-result="1" />'
                    }
                });
                uiMap.addElement('allPages', {
                    name: 'topics'
                    , description: 'sidebar links to topic categories'
                    , args: [
                        {
                            name: 'topic'
                            , description: 'the name of the topic'
                            , defaultValues: topics
                        }
                    ]
                    , getLocator: function(args) {
                        return "//div[@id='topiclist']/ul/li" +
                                "/a[text()=" + args.topic.quoteForXPath() + "]";
                    }
                    , testcase1: {
                        args: {topic: 'foo'}
                        , xhtml: '<div id="topiclist"><ul><li>'
                                + '<a expected-result="1">foo</a>'
                                + '</li></ul></div>'
                    }
                });
                uiMap.addElement('allPages', {
                    name: 'copyright'
                    , description: 'footer link to copyright page'
                    , getLocator: function(args) {
                        return "//span[@class='copyright']/a";
                    }
                    , testcase1: {
                        xhtml: '<span class="copyright"><a expected-result="1" /></span>'
                    }
                });



// define UI elements for the homepage, i.e. "http://alistapart.com/", and
// magazine issue pages, i.e. "http://alistapart.com/issues/234".
                uiMap.addPageset({
                    name: 'issuePages'
                    , description: 'pages including magazine issues'
                    , pathRegexp: '(issues/.+)?'
                });
                uiMap.addElement('issuePages', {
                    name: 'article'
                    , description: 'front or issue page link to article'
                    , args: [
                        {
                            name: 'index'
                            , description: 'the index of the article'
                                    // an array of default values for the argument. A default
                                    // value is one that is passed to the getXPath() method of
                                    // the container UIElement object when trying to build an
                                    // element locator.
                                    //
                                    // range() may be used to count easily. Remember though that
                                    // the ending value does not include the right extreme; for
                                    // example range(1, 5) counts from 1 to 4 only.
                            , defaultValues: range(1, 5)
                        }
                    ]
                    , getLocator: function(args) {
                        return "//div[@class='item'][" + args.index + "]/h4/a";
                    }
                });
                uiMap.addElement('issuePages', {
                    name: 'author'
                    , description: 'article author link'
                    , args: [
                        {
                            name: 'index'
                            , description: 'the index of the author, by article'
                            , defaultValues: range(1, 5)
                        }
                    ]
                    , getLocator: function(args) {
                        return "//div[@class='item'][" + args.index + "]/h5/a";
                    }
                });
                uiMap.addElement('issuePages', {
                    name: 'store'
                    , description: 'alistapart.com store link'
                    , locator: "//ul[@id='banners']/li/a[@title='ALA Store']/img"
                });
                uiMap.addElement('issuePages', {
                    name: 'special_article'
                    , description: "editor's choice article link"
                    , locator: "//div[@id='choice']/h4/a"
                });
                uiMap.addElement('issuePages', {
                    name: 'special_author'
                    , description: "author link of editor's choice article"
                    , locator: "//div[@id='choice']/h5/a"
                });



// define UI elements for the articles page, i.e.
// "http://alistapart.com/articles"
                uiMap.addPageset({
                    name: 'articleListPages'
                    , description: 'page with article listings'
                    , paths: ['articles']
                });
                uiMap.addElement('articleListPages', {
                    name: 'issue'
                    , description: 'link to issue'
                    , args: [
                        {
                            name: 'index'
                            , description: 'the index of the issue on the page'
                            , defaultValues: range(1, 10)
                        }
                    ]
                    , getLocator: function(args) {
                        return "//h2[@class='ishinfo'][" + args.index + ']/a';
                    }
                    , genericLocator: "//h2[@class='ishinfo']/a"
                });
                uiMap.addElement('articleListPages', {
                    name: 'article'
                    , description: 'link to article, by issue and article number'
                    , args: [
                        {
                            name: 'issue_index'
                            , description: "the index of the article's issue on the page; "
                                    + 'typically five per page'
                            , defaultValues: range(1, 6)
                        }
                        , {
                            name: 'article_index'
                            , description: 'the index of the article within the issue; '
                                    + 'typically two per issue'
                            , defaultValues: range(1, 5)
                        }
                    ]
                    , getLocator: function(args) {
                        var xpath = "//h2[@class='ishinfo'][" + (args.issue_index || 1) + ']'
                                + "/following-sibling::div[@class='item']"
                                + '[' + (args.article_index || 1) + "]/h3[@class='title']/a";
                        return xpath;
                    }
                    , genericLocator: "//h2[@class='ishinfo']"
                            + "/following-sibling::div[@class='item']/h3[@class='title']/a"
                });
                uiMap.addElement('articleListPages', {
                    name: 'author'
                    , description: 'article author link, by issue and article'
                    , args: [
                        {
                            name: 'issue_index'
                            , description: "the index of the article's issue on the page; \
typically five per page"
                            , defaultValues: range(1, 6)
                        }
                        , {
                            name: 'article_index'
                            , description: "the index of the article within the issue; \
typically two articles per issue"
                            , defaultValues: range(1, 3)
                        }
                    ]
                            // this XPath uses the "following-sibling" axis. The div elements for
                            // the articles in an issue are not children, but siblings of the h2
                            // element identifying the article.
                    , getLocator: function(args) {
                        var xpath = "//h2[@class='ishinfo'][" + (args.issue_index || 1) + ']'
                                + "/following-sibling::div[@class='item']"
                                + '[' + (args.article_index || 1) + "]/h4[@class='byline']/a";
                        return xpath;
                    }
                    , genericLocator: "//h2[@class='ishinfo']"
                            + "/following-sibling::div[@class='item']/h4[@class='byline']/a"
                });
                uiMap.addElement('articleListPages', {
                    name: 'next_page'
                    , description: 'link to next page of articles (older)'
                    , locator: "//a[contains(text(),'Next page')]"
                });
                uiMap.addElement('articleListPages', {
                    name: 'previous_page'
                    , description: 'link to previous page of articles (newer)'
                    , locator: "//a[contains(text(),'Previous page')]"
                });



// define UI elements for specific article pages, i.e.
// "http://alistapart.com/articles/culturalprobe"
                uiMap.addPageset({
                    name: 'articlePages'
                    , description: 'pages for actual articles'
                    , pathRegexp: 'articles/.+'
                });
                uiMap.addElement('articlePages', {
                    name: 'title'
                    , description: 'article title loop-link'
                    , locator: "//div[@id='content']/h1[@class='title']/a"
                });
                uiMap.addElement('articlePages', {
                    name: 'author'
                    , description: 'article author link'
                    , locator: "//div[@id='content']/h3[@class='byline']/a"
                });
                uiMap.addElement('articlePages', {
                    name: 'article_topics'
                    , description: 'links to topics under which article is published, before \
article content'
                    , args: [
                        {
                            name: 'topic'
                            , description: 'the name of the topic'
                            , defaultValues: keys(subtopics)
                        }
                    ]
                    , getLocator: function(args) {
                        return "//ul[@id='metastuff']/li/a"
                                + "[@title=" + args.topic.quoteForXPath() + "]";
                    }
                });
                uiMap.addElement('articlePages', {
                    name: 'discuss'
                    , description: 'link to article discussion area, before article content'
                    , locator: "//ul[@id='metastuff']/li[@class='discuss']/p/a"
                });
                uiMap.addElement('articlePages', {
                    name: 'related_topics'
                    , description: 'links to topics under which article is published, after \
article content'
                    , args: [
                        {
                            name: 'topic'
                            , description: 'the name of the topic'
                            , defaultValues: keys(subtopics)
                        }
                    ]
                    , getLocator: function(args) {
                        return "//div[@id='learnmore']/p/a"
                                + "[@title=" + args.topic.quoteForXPath() + "]";
                    }
                });
                uiMap.addElement('articlePages', {
                    name: 'join_discussion'
                    , description: 'link to article discussion area, after article content'
                    , locator: "//div[@class='discuss']/p/a"
                });



                uiMap.addPageset({
                    name: 'topicListingPages'
                    , description: 'top level listing of topics'
                    , paths: ['topics']
                });
                uiMap.addElement('topicListingPages', {
                    name: 'topic'
                    , description: 'link to topic category'
                    , args: [
                        {
                            name: 'topic'
                            , description: 'the name of the topic'
                            , defaultValues: topics
                        }
                    ]
                    , getLocator: function(args) {
                        return "//div[@id='content']/h2/a"
                                + "[text()=" + args.topic.quoteForXPath() + "]";
                    }
                });
                uiMap.addElement('topicListingPages', {
                    name: 'subtopic'
                    , description: 'link to subtopic category'
                    , args: [
                        {
                            name: 'subtopic'
                            , description: 'the name of the subtopic'
                            , defaultValues: keys(subtopics)
                        }
                    ]
                    , getLocator: function(args) {
                        return "//div[@id='content']" +
                                "/descendant::a[text()=" + args.subtopic.quoteForXPath() + "]";
                    }
                });

// the following few subtopic page UI elements are very similar. Define UI
// elements for the code page, which is a subpage under topics, i.e.
// "http://alistapart.com/topics/code/"
                uiMap.addPageset({
                    name: 'subtopicListingPages'
                    , description: 'pages listing subtopics'
                    , pathPrefix: 'topics/'
                    , paths: [
                        'code'
                                , 'content'
                                , 'culture'
                                , 'design'
                                , 'process'
                                , 'userscience'
                    ]
                });
                uiMap.addElement('subtopicListingPages', {
                    name: 'subtopic'
                    , description: 'link to a subtopic category'
                    , args: [
                        {
                            name: 'subtopic'
                            , description: 'the name of the subtopic'
                            , defaultValues: keys(subtopics)
                        }
                    ]
                    , getLocator: function(args) {
                        return "//div[@id='content']/h2" +
                                "/a[text()=" + args.subtopic.quoteForXPath() + "]";
                    }
                });



// subtopic articles page
                uiMap.addPageset({
                    name: 'subtopicArticleListingPages'
                    , description: 'pages listing the articles for a given subtopic'
                    , pathRegexp: 'topics/[^/]+/.+'
                });
                uiMap.addElement('subtopicArticleListingPages', {
                    name: 'article'
                    , description: 'link to a subtopic article'
                    , args: [
                        {
                            name: 'index'
                            , description: 'the index of the article'
                            , defaultValues: range(1, 51) // the range seems unlimited ...
                        }
                    ]
                    , getLocator: function(args) {
                        return "//div[@id='content']/div[@class='item']"
                                + "[" + args.index + "]/h3/a";
                    }
                    , testcase1: {
                        args: {index: 2}
                        , xhtml: '<div id="content"><div class="item" /><div class="item">'
                                + '<h3><a expected-result="1" /></h3></div></div>'
                    }
                });
                uiMap.addElement('subtopicArticleListingPages', {
                    name: 'author'
                    , description: "link to a subtopic article author's page"
                    , args: [
                        {
                            name: 'article_index'
                            , description: 'the index of the authored article'
                            , defaultValues: range(1, 51)
                        }
                        , {
                            name: 'author_index'
                            , description: 'the index of the author when there are multiple'
                            , defaultValues: range(1, 4)
                        }
                    ]
                    , getLocator: function(args) {
                        return "//div[@id='content']/div[@class='item'][" +
                                args.article_index + "]/h4/a[" +
                                (args.author_index ? args.author_index : '1') + ']';
                    }
                });
                uiMap.addElement('subtopicArticleListingPages', {
                    name: 'issue'
                    , description: 'link to issue a subtopic article appears in'
                    , args: [
                        {
                            name: 'index'
                            , description: 'the index of the subtopic article'
                            , defaultValues: range(1, 51)
                        }
                    ]
                    , getLocator: function(args) {
                        return "//div[@id='content']/div[@class='item']"
                                + "[" + args.index + "]/h5/a";
                    }
                });



                uiMap.addPageset({
                    name: 'aboutPages'
                    , description: 'the website about page'
                    , paths: ['about']
                });
                uiMap.addElement('aboutPages', {
                    name: 'crew'
                    , description: 'link to site crew member bio or personal website'
                    , args: [
                        {
                            name: 'role'
                            , description: 'the role of the crew member'
                            , defaultValues: [
                                'ALA Crew'
                                        , 'Support'
                                        , 'Emeritus'
                            ]
                        }
                        , {
                            name: 'role_index'
                            , description: 'the index of the member within the role'
                            , defaultValues: range(1, 20)
                        }
                        , {
                            name: 'member_index'
                            , description: 'the index of the member within the role title'
                            , defaultValues: range(1, 5)
                        }
                    ]
                    , getLocator: function(args) {
                        // the first role is kind of funky, and requires a conditional to
                        // build the XPath correctly. Its header looks like this:
                        //
                        // <h3>
                        // <span class="caps">ALA 4</span>.0 <span class="caps">CREW</span>
                        // </h3>
                        //
                        // This kind of complexity is a little daunting, but you can see
                        // how the format can handle it relatively easily and concisely.
                        if (args.role == 'ALA Crew') {
                            var selector = "descendant::text()='CREW'";
                        }
                        else {
                            var selector = "text()=" + args.role.quoteForXPath();
                        }
                        var xpath =
                                "//div[@id='secondary']/h3[" + selector + ']' +
                                "/following-sibling::dl/dt[" + (args.role_index || 1) + ']' +
                                '/a[' + (args.member_index || '1') + ']';
                        return xpath;
                    }
                });



                uiMap.addPageset({
                    name: 'searchResultsPages'
                    , description: 'pages listing search results'
                    , paths: ['search']
                });
                uiMap.addElement('searchResultsPages', {
                    name: 'result_link'
                    , description: 'search result link'
                    , args: [
                        {
                            name: 'index'
                            , description: 'the index of the search result'
                            , defaultValues: range(1, 11)
                        }
                    ]
                    , getLocator: function(args) {
                        return "//div[@id='content']/ul[" + args.index + ']/li/h3/a';
                    }
                });
                uiMap.addElement('searchResultsPages', {
                    name: 'more_results_link'
                    , description: 'next or previous results link at top or bottom of page'
                    , args: [
                        {
                            name: 'direction'
                            , description: 'next or previous results page'
                                    // demonstrate a method which acquires default values from the
                                    // document object. Such default values may contain EITHER commas
                                    // OR equals signs, but NOT BOTH.
                            , getDefaultValues: function(inDocument) {
                                var defaultValues = [];
                                var divs = inDocument.getElementsByTagName('div');
                                for (var i = 0; i < divs.length; ++i) {
                                    if (divs[i].className == 'pages') {
                                        break;
                                    }
                                }
                                var links = divs[i].getElementsByTagName('a');
                                for (i = 0; i < links.length; ++i) {
                                    defaultValues.push(links[i].innerHTML
                                            .replace(/^\xab\s*/, "")
                                            .replace(/\s*\bb$/, "")
                                            .replace(/\s*\d+$/, ""));
                                }
                                return defaultValues;
                            }
                        }
                        , {
                            name: 'position'
                            , description: 'position of the link'
                            , defaultValues: ['top', 'bottom']
                        }
                    ]
                    , getLocator: function(args) {
                        return "//div[@id='content']/div[@class='pages']["
                                + (args.position == 'top' ? '1' : '2') + ']'
                                + "/a[contains(text(), "
                                + (args.direction ? args.direction.quoteForXPath() : undefined)
                                + ")]";
                    }
                });



                uiMap.addPageset({
                    name: 'commentsPages'
                    , description: 'pages listing comments made to an article'
                    , pathRegexp: 'comments/.+'
                });
                uiMap.addElement('commentsPages', {
                    name: 'article_link'
                    , description: 'link back to the original article'
                    , locator: "//div[@id='content']/h1[@class='title']/a"
                });
                uiMap.addElement('commentsPages', {
                    name: 'comment_link'
                    , description: 'same-page link to comment'
                    , args: [
                        {
                            name: 'index'
                            , description: 'the index of the comment'
                            , defaultValues: range(1, 11)
                        }
                    ]
                    , getLocator: function(args) {
                        return "//div[@class='content']/div[contains(@class, 'comment')]" +
                                '[' + args.index + ']/h4/a[2]';
                    }
                });
                uiMap.addElement('commentsPages', {
                    name: 'paging_link'
                    , description: 'links to more pages of comments'
                    , args: [
                        {
                            name: 'dest'
                            , description: 'the destination page'
                            , defaultValues: ['next', 'prev'].concat(range(1, 16))
                        }
                        , {
                            name: 'position'
                            , description: 'position of the link'
                            , defaultValues: ['top', 'bottom']
                        }
                    ]
                    , getLocator: function(args) {
                        var dest = args.dest;
                        var xpath = "//div[@id='content']/div[@class='pages']" +
                                '[' + (args.position == 'top' ? '1' : '2') + ']/p';
                        if (dest == 'next' || dest == 'prev') {
                            xpath += "/a[contains(text(), " + dest.quoteForXPath() + ")]";
                        }
                        else {
                            xpath += "/a[text()=" + dest.quoteForXPath() + "]";
                        }
                        return xpath;
                    }
                });



                uiMap.addPageset({
                    name: 'authorPages'
                    , description: 'personal pages for each author'
                    , pathRegexp: 'authors/[a-z]/.+'
                });
                uiMap.addElement('authorPages', {
                    name: 'article'
                    , description: "link to article written by this author.\n"
                            + 'This description has a line break.'
                    , args: [
                        {
                            name: 'index'
                            , description: 'index of the article on the page'
                            , defaultValues: range(1, 11)
                        }
                    ]
                    , getLocator: function(args) {
                        var index = args.index;
                        // try out the CSS locator!
                        //return "//h4[@class='title'][" + index + "]/a";
                        return 'css=h4.title:nth-child(' + index + ') > a';
                    }
                    , testcase1: {
                        args: {index: '2'}
                        , xhtml: '<h4 class="title" /><h4 class="title">'
                                + '<a expected-result="1" /></h4>'
                    }
                });



// test the offset locator. Something like the following can be recorded:
// ui=qaPages::content()//a[contains(text(),'May I quote from your articles?')]
                uiMap.addPageset({
                    name: 'qaPages'
                    , description: 'question and answer pages'
                    , pathRegexp: 'qa'
                });
                uiMap.addElement('qaPages', {
                    name: 'content'
                    , description: 'the content pane containing the q&a entries'
                    , locator: "//div[@id='content' and "
                            + "child::h1[text()='Questions and Answers']]"
                    , getOffsetLocator: uiMap.defaultOffsetLocatorStrategy
                });
                uiMap.addElement('qaPages', {
                    name: 'last_updated'
                    , description: 'displays the last update date'
                            // demonstrate calling getLocator() for another UI element within a
                            // getLocator(). The former must have already been added to the map. And
                            // obviously, you can't randomly combine different locator types!
                    , locator: uiMap.getUIElement('qaPages', 'content').getLocator() + '/p/em'
                });



//******************************************************************************

                //var rollupManager = new RollupManager();

// though the description element is required, its content is free form. You
// might want to create a documentation policy as given below, where the pre-
// and post-conditions of the rollup are spelled out.
//
// To take advantage of a "heredoc" like syntax for longer descriptions,
// add a backslash to the end of the current line and continue the string on
// the next line.
                rollupManager.addRollupRule({
                    name: 'navigate_to_subtopic_article_listing'
                    , description: 'drill down to the listing of articles for a given subtopic \
from the section menu, then the topic itself.'
                    , pre: 'current page contains the section menu (most pages should)'
                    , post: 'navigated to the page listing all articles for a given subtopic'
                    , args: [
                        {
                            name: 'subtopic'
                            , description: 'the subtopic whose article listing to navigate to'
                            , exampleValues: keys(subtopics)
                        }
                    ]
                    , commandMatchers: [
                        {
                            command: 'clickAndWait'
                            , target: 'ui=allPages::section\\(section=topics\\)'
                                    // must escape parentheses in the the above target, since the
                                    // string is being used as a regular expression. Again, backslashes
                                    // in strings must be escaped too.
                        }
                        , {
                            command: 'clickAndWait'
                            , target: 'ui=topicListingPages::topic\\(.+'
                        }
                        , {
                            command: 'clickAndWait'
                            , target: 'ui=subtopicListingPages::subtopic\\(.+'
                            , updateArgs: function(command, args) {
                                // don't bother stripping the "ui=" prefix from the locator
                                // here; we're just using UISpecifier to parse the args out
                                var uiSpecifier = new UISpecifier(command.target);
                                args.subtopic = uiSpecifier.args.subtopic;
                                return args;
                            }
                        }
                    ]
                    , getExpandedCommands: function(args) {
                        var commands = [];
                        var topic = subtopics[args.subtopic];
                        var subtopic = args.subtopic;
                        commands.push({
                            command: 'clickAndWait'
                            , target: 'ui=allPages::section(section=topics)'
                        });
                        commands.push({
                            command: 'clickAndWait'
                            , target: 'ui=topicListingPages::topic(topic=' + topic + ')'
                        });
                        commands.push({
                            command: 'clickAndWait'
                            , target: 'ui=subtopicListingPages::subtopic(subtopic=' + subtopic
                                    + ')'
                        });
                        commands.push({
                            command: 'verifyLocation'
                            , target: 'regexp:.+/topics/.+/.+'
                        });
                        return commands;
                    }
                });



                rollupManager.addRollupRule({
                    name: 'replace_click_with_clickAndWait'
                    , description: 'replaces commands where a click was detected with \
clickAndWait instead'
                    , alternateCommand: 'clickAndWait'
                    , commandMatchers: [
                        {
                            command: 'click'
                            , target: 'ui=subtopicArticleListingPages::article\\(.+'
                        }
                    ]
                    , expandedCommands: []
                });



                rollupManager.addRollupRule({
                    name: 'navigate_to_subtopic_article'
                    , description: 'navigate to an article listed under a subtopic.'
                    , pre: 'current page contains the section menu (most pages should)'
                    , post: 'navigated to an article page'
                    , args: [
                        {
                            name: 'subtopic'
                            , description: 'the subtopic whose article listing to navigate to'
                            , exampleValues: keys(subtopics)
                        }
                        , {
                            name: 'index'
                            , description: 'the index of the article in the listing'
                            , exampleValues: range(1, 11)
                        }
                    ]
                    , commandMatchers: [
                        {
                            command: 'rollup'
                            , target: 'navigate_to_subtopic_article_listing'
                            , value: 'subtopic\\s*=.+'
                            , updateArgs: function(command, args) {
                                var args1 = parse_kwargs(command.value);
                                args.subtopic = args1.subtopic;
                                return args;
                            }
                        }
                        , {
                            command: 'clickAndWait'
                            , target: 'ui=subtopicArticleListingPages::article\\(.+'
                            , updateArgs: function(command, args) {
                                var uiSpecifier = new UISpecifier(command.target);
                                args.index = uiSpecifier.args.index;
                                return args;
                            }
                        }
                    ]
                            /*
                             // this is pretty much equivalent to the commandMatchers immediately above.
                             // Seems more verbose and less expressive, doesn't it? But sometimes you
                             // might prefer the flexibility of a function.
                             , getRollup: function(commands) {
                             if (commands.length >= 2) {
                             command1 = commands[0];
                             command2 = commands[1];
                             var args1 = parse_kwargs(command1.value);
                             try {
                             var uiSpecifier = new UISpecifier(command2.target
                             .replace(/^ui=/, ''));
                             }
                             catch (e) {
                             return false;
                             }
                             if (command1.command == 'rollup' &&
                             command1.target == 'navigate_to_subtopic_article_listing' &&
                             args1.subtopic &&
                             command2.command == 'clickAndWait' &&
                             uiSpecifier.pagesetName == 'subtopicArticleListingPages' &&
                             uiSpecifier.elementName == 'article') {
                             var args = {
                             subtopic: args1.subtopic
                             , index: uiSpecifier.args.index
                             };
                             return {
                             command: 'rollup'
                             , target: this.name
                             , value: to_kwargs(args)
                             , replacementIndexes: [ 0, 1 ]
                             };
                             }
                             }
                             return false;
                             }
                             */
                    , getExpandedCommands: function(args) {
                        var commands = [];
                        commands.push({
                            command: 'rollup'
                            , target: 'navigate_to_subtopic_article_listing'
                            , value: to_kwargs({subtopic: args.subtopic})
                        });
                        var uiSpecifier = new UISpecifier(
                                'subtopicArticleListingPages'
                                , 'article'
                                , {index: args.index});
                        commands.push({
                            command: 'clickAndWait'
                            , target: 'ui=' + uiSpecifier.toString()
                        });
                        commands.push({
                            command: 'verifyLocation'
                            , target: 'regexp:.+/articles/.+'
                        });
                        return commands;
                    }
                });


                console.log("Loaded Map: " + filename);
            });

        },
        to: function(specifier) {

            console.log(uiMap);

            console.log(uiMap.getPageset("issue"));

            var locator;

            console.log("Searching: " + specifier);

            locator = uiMap.getLocator(specifier);

            console.log("Found: " + locator);

            return locator;

        }

    };

    // Private/Support Functions
    function is_IDE() {
        return false;
    }

    function safe_alert(message) {

        console.log(message);
    }

    

}();