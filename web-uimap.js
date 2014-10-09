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
   
    /* 
     * Create Map
     */
   
    var rollupManager;
    
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

        return new UIMap();

    }(); // End of Create Map

    
    // Return Mapper Object

    return {
        load: function(filename) {

            fs.readFile(filename, function(err, data) {

                if (err) {
                    throw err;
                }

                //var libarayCall = new Function(data);

                //libarayCall();

                eval(data);

//console.log(data);

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

}(); // End of Export Function