function Arr(...args) {
    let a = [...args];
    a.add = a.push
    a.__defineGetter__("top", function () { return this[this.length - 1] })
    return a;
}

function is_alpha(v) {
    if (v instanceof Array) {
        return false
    }
    return /^[a-zA-Z]+$/.test(v)
}
function is_alphanum(v) {
    if (v instanceof Array) {
        return false
    }
    return /^[a-zA-Z0-9]+$/.test(v)
}
function is_numeric(v) {
    if (v instanceof Array) {
        return false
    }
    return /^[a-zA-Z0-9]+$/.test(v)
}
function is_valid_identifier(v) {
    if (v instanceof Array) {
        return false
    }
    return /^[_a-zA-Z][a-zA-Z0-9]*$/.test(v)
}

function __interpreter() {
    let keywords = {
        "auto": [0, 1],
        "break": [0, 2],
        "case": [0, 3],
        "char": [0, 4],
        "const": [0, 5],
        "continue": [0, 6],
        "default": [0, 7],
        "do": [0, 8],
        "double": [0, 9],
        "else": [0, 10],
        "enum": [0, 11],
        "float": [0, 12],
        "for": [0, 13],
        "int": [0, 14],
        "long": [0, 15],
        "return": [0, 16],
        "short": [0, 17],
        "signed": [0, 18],
        "sizeof": [0, 19],
        "static": [0, 20],
        "struct": [0, 21],
        "switch": [0, 22],
        "typedef": [0, 23],
        "union": [0, 24],
        "unsigned": [0, 25],
        "void": [0, 26],
        "while": [0, 27]
    };
    let operators = {
        "POST_INCREMENT": [1, 0],
        "POST_DECREMENT": [1, 1],
        '(': [1, 2],
        ')': [1, 3],
        '{': [1, 4],
        '}': [1, 5],
        "[": [1, 6],
        "]": [1, 7],
        ".": [1, 8],
        "->": [1, 9],
        "PRE_INCREMENT": [1, 10],
        "PRE_DECREMENT": [1, 11],
        "UNARY_PLUS": [1, 12],
        "UNARY_MINUS": [1, 13],
        "!": [1, 14],
        "~": [1, 15],
        "TYPECAST": [1, 16],
        "DEREFERENCE": [1, 17],
        "ADDRESS": [1, 18],
        "MULTIPLY": [1, 19],
        "/": [1, 20],
        "ADD": [1, 21],
        "SUBTRACT": [1, 22],
        "%": [1, 23],
        "<<": [1, 24],
        ">>": [1, 25],
        "<": [1, 26],
        "<=": [1, 27],
        ">": [1, 28],
        ">=": [1, 29],
        "==": [1, 30],
        "!=": [1, 31],
        "|": [1, 32],
        "^": [1, 33],
        "&&": [1, 34],
        "||": [1, 35],
        "=": [1, 36],
        "+=": [1, 37],
        "-=": [1, 38],
        "*=": [1, 39],
        "/=": [1, 40],
        "%=": [1, 41],
        "<<=": [1, 42],
        ">>=": [1, 43],
        "&=": [1, 44],
        "^=": [1, 45],
        "|=": [1, 46],
        "TERNARY": [1, 47],
        ",": [1, 48],
        "BITWISE_AND": [1, 49],
        "TOKEN_?": [1, 50],
        "TOKEN_:": [1, 51],
        "TOKEN_+": [1, 52],
        "TOKEN_-": [1, 53],
        "TOKEN_&": [1, 54],
        "TOKEN_*": [1, 55],
        "TOKEN_++": [1, 56],
        "TOKEN_--": [1, 57],
        ";": [1, 58],
    };
    this.Preprocessor = function (lines) {
        //checking for directives
        debugger;
        let ERROR_OCCURED=false,ERR_msg='',last_line=0;
        let out=[],directives={"define":[],"include":[],"undef":[],"ifdef":[],"ifndef":[],"else":[],"endif":[]};
        for(let i=0; i<lines.length; i++) {
            if(lines[i][0]>last_line){
                last_line=lines[i][0]
            }
            if(/^\s*#\s*/.test(lines[i][1])){
                let line=lines[i][1].slice(lines[i][1].indexOf("#")+1);
                if(/^\s*define\s+.+/.test(line)){
                    let j=line.indexOf('define')+7,word='',rpl='';
                    while(j<line.length) {
                        if(is_alphanum(line[j]) || line[j]=='_'){
                            word+=line[j];
                        }
                        else if(/^\s$/.test(line[j])){
                            if (word!=''){
                                rpl=line.slice(j)
                                break;
                            }
                        }
                        j++;
                    }
                    if(!is_valid_identifier(word)){
                        ERROR_OCCURED=true;
                        ERR_msg="Invalid identifier in #define"
                    }
                    else{
                        directives['define'].push([i,word,rpl])
                    }
                }
                else if(/^\s*undef\s+$/.test(line)){
                    let j=line.indexOf('undef')+6,word='';
                    while(j<line.length) {
                        if(is_alphanum(line[j]) || line[j]=='_'){
                            word+=line[j];
                        }
                        else if(/^\s$/.test(line[j])){
                            if (word!=''){
                                rpl=line.slice(j)
                                break;
                            }
                        }
                        j++;
                    }
                    if(!is_valid_identifier(word)){
                        ERROR_OCCURED=true;
                        ERR_msg="Invalid identifier in #undef"
                    }
                    else{
                        directives['undef'].push([i,word])
                    }
                }
                if (ERROR_OCCURED) {
                    return { 'error at': [line_no, lines[line_no][1]], 'error message': ERR_msg }
                }
                out.push([lines[i][0],''])
            }
            else{
                out.push(lines[i])
            }
        }
        //#define handling
        let definition={/* Identifier:[[start line, repl]] */}
        for(let i=0;i<directives['define'].length;i++){
            if(!(directives['define'][i][1] in definition)){
                definition[directives['define'][i][1]]=[]
            }
            definition[directives['define'][i][1]].push([directives['define'][i][0],directives['define'][i][2]])
        }
        for(let i=0;i<directives['undef'].length;i++){
            if(!(directives['undef'][i][1] in definition)){
                definition[directives['undef'][i][1]]=[]
            }
            definition[directives['undef'][i][1]].push([directives['undef'][i][0]])
        }
        for(let i in definition){
            definition[i].push([-1])
            definition[i].push([last_line+1])
            definition[i].sort((a,b)=>a[0]-b[0])
            let regions=[],mode=0;
            for(let j=0;j<definition[i].length;j++){
                if(mode==0){

                }
            }
        }
    }
    this.Lexer = function (lines) {
        /*
        lines must be a sorted iterable with elements in format 
        [line number, text]
        
        Token format: <Type,Value>
        Types:
        Keyword=0;
        Operators=1;
        Identifiers=2;
        Constants=3;
        Strings=4;
        */
        let tokenList = Arr(), symbolTable = { "identifiers": {}, "identifiers_length": 0, "constants": {}, "constants_length": 0, "strings_length": 0, "strings": {}, "all": {}, "length": 0 }
        function add_identifier(value) {
            if (symbolTable["identifiers"][value] === undefined) {
                symbolTable["identifiers"][value] = [2, symbolTable["identifiers_length"]]
                symbolTable["all"][value] = symbolTable["identifiers"][value]
                symbolTable["length"] += 1
                symbolTable["identifiers_length"] += 1
                return symbolTable["identifiers"][value]
            }
        }
        // function add_constant(value) { //was unneeded
        //     if (symbolTable["constants"][value] === undefined) {
        //         symbolTable["constants"][value] = [2, symbolTable["constants_length"]]
        //         symbolTable["all"][value] = symbolTable["constants"][value]
        //         symbolTable["length"] += 1
        //         symbolTable["constants_length"] += 1
        //     }
        // }
        function add_string(value) {
            let v = value
            value = String.fromCharCode(...v)
            v.push(0)
            if (symbolTable["strings"][value] === undefined) {
                symbolTable["strings"][value] = [4, symbolTable["strings_length"], v]
                symbolTable["all"][value] = symbolTable["strings"][value]
                symbolTable["length"] += 1
                symbolTable["strings_length"] += 1
                return symbolTable["strings"][value]
            }
        }
        let cur_line = lines[0][0], reading = "", reading_state = 'none';
        let read_line = cur_line;
        let ERROR_OCCURED = false, ERR_msg = "";
        function is_keyword(v) {
            return (v in keywords)
        }
        function is_white(v) {
            return /^\s*$/.test(v)
        }
        function dfa(chr, line_no) {
            // identifying identifiers, keywords, operators and constants
            function clear() {
                read_line = line_no
                reading_state = 'none'
                reading = ""
            }
            function revert() {
                clear();
                dfa(chr, line_no)
            }
            let hex_digit = {
                0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9,
                'a': 10, 'b': 11, 'c': 12, 'd': 13, 'e': 14, 'f': 15,
                'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15
            }, escape_sequence = {
                'a': 7, 'b': 8, 'f': 12, 'n': 10, 'r': 13,
                't': 9, 'v': 11, '\\': 92, "'": 39, '"': 34,
            }
            if(reading_state=='none'){
                if (reading.length == 0) {
                    reading = chr;
                    read_line = cur_line
                    if (is_white(reading)) {
                        clear();
                    }
                    return
                }
                if (is_valid_identifier(reading)) {
                    if (is_valid_identifier(reading + chr)) {
                        reading += chr
                    }
                    else {
                        if (is_keyword(reading)) {
                            tokenList.add([read_line, keywords[reading]])
                        }
                        else {
                            add_identifier(reading)
                            tokenList.add([read_line, symbolTable['identifiers'][reading]])
                        }
                        revert()
                    }
                    return
                }
                if (reading == "+") {
                    if (chr == '+') {
                        tokenList.add([read_line, operators["TOKEN_++"]])
                        clear()
                    }
                    else if (chr == '=') {
                        tokenList.add([read_line, operators["+="]])
                        clear()
                    }
                    else {
                        tokenList.add([read_line, operators["TOKEN_+"]])
                        revert()
                    }
                    return;
                }
                if (reading == "-") {
                    if (chr == '-') {
                        tokenList.add([read_line, operators["TOKEN_--"]])
                        clear()
                    }
                    else if (chr == '=') {
                        tokenList.add([read_line, operators["-="]])
                        clear()
                    }
                    else if (chr == '>') {
                        tokenList.add([read_line, operators["->"]])
                        clear()
                    }
                    else {
                        tokenList.add([read_line, operators["TOKEN_-"]])
                        revert();
                    }
                    return;
                }
                if (reading == "%") {
                    if (chr == '=') {
                        tokenList.add([read_line, operators["%="]])
                        clear();
                    }
                    else {
                        tokenList.add([read_line, operators["%"]])
                        revert();
                    }
                    return;
                }
                if (reading == "/") {
                    if (chr == '=') {
                        tokenList.add([read_line, operators["/="]])
                        clear();
                    }
                    else if (chr == '/') {
                        reading = '//'
                        reading_state = 'single_comment';
                    }
                    else if (chr == '*') {
                        reading_state = 'multi_comment';
                        reading = '/*';
                    }
                    else {
                        tokenList.add([read_line, operators["/"]])
                        revert();
                    }
                    return;
                }
                if (reading == "*") {
                    if (chr == "=") {
                        tokenList.add([read_line, operators["*="]])
                        clear();
                    }
                    else {
                        tokenList.add([read_line, operators['TOKEN_*']])
                        revert();
                    }
                    return
                }
                if (reading == "!") {
                    if (chr == "=") {
                        tokenList.add([read_line, operators["!="]])
                        clear();
                    }
                    else {
                        tokenList.add([read_line, operators["!"]])
                        revert();
                    }
                    return
                }
                if (reading == "(") {
                    tokenList.add([read_line, operators['(']])
                    revert();
                    return
                }
                if (reading == ")") {
                    tokenList.add([read_line, operators[')']])
                    revert();
                    return
                }
                if (reading == "{") {
                    tokenList.add([read_line, operators['{']])
                    revert();
                    return
                }
                if (reading == "}") {
                    tokenList.add([read_line, operators['}']])
                    revert();
                    return
                }
                if (reading == "[") {
                    tokenList.add([read_line, operators['[']])
                    revert();
                    return
                }
                if (reading == "]") {
                    tokenList.add([read_line, operators[']']])
                    revert();
                    return
                }
                if (reading == ".") {
                    tokenList.add([read_line, operators['.']])
                    revert();
                    return
                }
                if (reading == "~") {
                    tokenList.add([read_line, operators['~']])
                    revert();
                    return
                }
                if (reading == "<") {
                    if (chr == "=") {
                        tokenList.add([read_line, operators['<="']])
                        clear();
                    }
                    else if (chr == "<") {
                        reading = "<<"
                    }
                    else {
                        tokenList.add([read_line, operators['<']])
                        revert();
                    }
                    return
                }
                if (reading == ">") {
                    if (chr == "=") {
                        tokenList.add([read_line, operators['>="']])
                        clear();
                    }
                    else if (chr == ">") {
                        reading = ">>"
                    }
                    else {
                        tokenList.add([read_line, operators['>']])
                        revert();
                    }
                    return
                }
                if (reading == "<<") {
                    if (chr == "=") {
                        tokenList.add([read_line, operators['<<=']]);
                        clear();
                    }
                    else {
                        tokenList.add([read_line, operators['<<']]);
                        revert();
                    }
                    return
                }
                if (reading == ">>") {
                    if (chr == "=") {
                        tokenList.add([read_line, operators['>>=']]);
                        clear();
                    }
                    else {
                        tokenList.add([read_line, operators['>>']]);
                        revert();
                    }
                    return
                }
                if (reading == "&") {
                    if (chr == "=") {
                        tokenList.add([read_line, operators['&=']]);
                        clear();
                    }
                    else if (chr == "&") {
                        tokenList.add([read_line, operators['&&']]);
                        clear();
                    }
                    else {
                        tokenList.add([read_line, operators['TOKEN_&']]);
                        revert();
                    }
                    return
                }
                if (reading == "^") {
                    if (chr == "=") {
                        tokenList.add([read_line, operators['^=']]);
                        clear();
                    }
                    else {
                        tokenList.add([read_line, operators['^']]);
                        revert();
                    }
                    return
                }
                if (reading == "|") {
                    if (chr == "=") {
                        tokenList.add([read_line, operators['|=']]);
                        clear();
                    }
                    else if (chr == "|") {
                        tokenList.add([read_line, operators['||']]);
                        clear();
                    }
                    else {
                        tokenList.add([read_line, operators['|']]);
                        revert();
                    }
                    return
                }
                if (reading == "?") {
                    tokenList.add([read_line, operators['TOKEN_?']]);
                    revert();
                    return
                }
                if (reading == ":") {
                    tokenList.add([read_line, operators['TOKEN_:']]);
                    revert();
                    return
                }
                if (reading == ",") {
                    tokenList.add([read_line, operators[',']]);
                    revert();
                    return
                }
                if (reading == ";") {
                    tokenList.add([read_line, operators[';']]);
                    revert();
                    return
                }
                if (reading == "=") {
                    if (chr == '=') {
                        tokenList.add([read_line, operators['==']]);
                        clear();
                    }
                    else {
                        tokenList.add([read_line, operators['=']]);
                        revert();
                    }
                    return
                }
                if (reading == '0') {
                    if (chr == 'b' || chr == 'B') {
                        //handle binary prefix
                        reading = "0b"
                    }
                    else if (chr == 'x' || chr == 'X') {
                        //handle Hexadecimal prefix
                        reading = "0x"
                    }
                    else if (chr == 'o' || chr == 'O') {
                        //handle octal prefix
                        reading = "0o"
                    }
                    else if (is_numeric(chr)) {
                        //handle octal prefix
                        reading = '0o' + chr
                    }
                    else if (chr == '.' || chr == 'e' || chr == 'E') {
                        //handle floating point exponents
                        if (chr == '.') {
                            reading = reading + chr
                            reading_state = 'float_dot'
                        }
                        else if (chr == 'e') {
                            reading = reading + chr
                            reading_state = 'float_expo'
                        }
                        else {
                            reading = '0e'
                            reading_state = 'float_expo'
                        }
                    }
                    else {
                        // store a Zero int;
                        tokenList.add([read_line, [3, ['i', 0]]]);
                        revert();
                    }
                    return
                }
                if (reading[0] == '0' && reading[1] == 'b') {
                    if (chr == '0' || chr == '1') {
                        reading += chr;
                    }
                    else if (is_numeric(chr)) {
                        ERROR_OCCURED = true;
                        ERR_msg = "incorrect binary format, 0 or 1 expected"
                    }
                    else if (reading == '0b') {
                        ERROR_OCCURED = true;
                        ERR_msg = "incorrect binary format, must have at least one bit"
                    }
                    else {
                        //convert binary to decimal
                        let val = 0;
                        for (let bin_ind = 2; bin_ind < reading.length; bin_ind++) {
                            val = val << 1;
                            if (reading[bin_ind] == '1') {
                                val++;
                            }
                        }
                        tokenList.add([read_line, [3, ['i', val]]]);
                        revert();
                    }
                    return
                }
                if (reading[0] == '0' && reading[1] == 'x') {
                    if (/^[a-fA-F0-9]$/.test(chr)) {
                        reading += chr;
                    }
                    else if (reading == '0x') {
                        ERROR_OCCURED = true;
                        ERR_msg = "Invalid Hex Format, expected at least one hex digit"
                    }
                    else {
                        //convert hex to decimal
                        let val = 0;
                        for (let hex_ind = 2; hex_ind < reading.length; hex_ind++) {
                            val = val << 4;
                            // if (is_numeric(reading[hex_ind])) {
                            //     val += Number(reading[hex_ind]);
                            // }
                            // else {
                            //     val += {
                            //         'a': 10, 'b': 11, 'c': 12, 'd': 13, 'e': 14, 'f': 15,
                            //         'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15
                            //     }[reading[hex_ind]];
                            // }
                            val += hex_digit[reading[hex_ind]]
                        }
                        tokenList.add([read_line, [3, ['i', val]]]);
                        revert();
                    }
                    return
                }
                if (reading[0] == '0' && reading[1] == 'o') {
                    if (/^[0-7]$/.test(chr)) {
                        reading += chr;
                    }
                    else if (is_numeric(chr)) {
                        ERROR_OCCURED = true;
                        ERR_msg = "Invalid Octal value, must be a number between 0 and 7";
                    }
                    else if (reading == '0o') {
                        ERROR_OCCURED = true;
                        ERR_msg = "Invalid Octal value, must have atleast one octal digit";
                    }
                    else {
                        //convert octal to decimal
                        let val = 0;
                        for (let hex_ind = 2; hex_ind < reading.length; hex_ind++) {
                            val = val << 4;
                            val += Number(reading[hex_ind]);
                        }
                        tokenList.add([read_line, [3, ['i', val]]]);
                        revert();
                    }
                    return
                }
                if (is_numeric(reading)) {
                    if (is_numeric(chr)) {
                        reading = reading + chr;
                    }
                    else if (chr == '.') {
                        reading = reading + chr;
                        reading_state = 'float_dot';
                    }
                    else if (chr == 'e') {
                        reading = reading + chr;
                        reading_state = 'float_expo';
                    }
                    else {
                        tokenList.add([read_line, [3, ['i', Number(reading)]]]);
                        revert();
                    }
                    return
                }
                //characters
                if (reading == "'") {
                    if (chr == "'") {
                        ERROR_OCCURED = true;
                        ERR_msg = "Empty character constant"
                    }
                    else if (chr == '\\') {
                        reading_state = 'char_escape'
                        reading = reading + chr
                    }
                    else {
                        reading = reading + chr;
                        reading_state = 'char+'
                    }
                    return
                }
                //strings
                if (reading == '"') {
                    reading_state = "string"
                    reading = Arr()
                    dfa(chr, line_no);
                    return
                }
            }
            //test for floating
            if (reading_state == 'float_dot') {
                if (is_numeric(chr)) {
                    reading = reading + chr;
                    reading_state = 'float_dot+';
                }
                else {
                    ERROR_OCCURED = true;
                    ERR_msg = "Invalid floating point number"
                }
                return
            }
            if (reading_state == 'float_expo') {
                if (is_numeric(chr)) {
                    reading = reading + chr;
                    reading_state = 'float_expo+';
                }
                else if (chr == '-') {
                    reading = reading + chr;
                    reading_state = 'float_expo-';
                }
                else if (chr == '+') {
                    reading = reading + chr;
                    reading_state = 'float_expo++';
                }
                else {
                    ERROR_OCCURED = true;
                    ERR_msg = "Invalid floating point number"
                }
                return
            }
            if (reading_state == 'float_dot+') {
                if (is_numeric(chr)) {
                    reading = reading + chr;
                }
                else if (chr == 'e' || chr == 'E') {
                    reading = reading + 'e';
                    reading_state = 'float_dot_expo'
                }
                else {
                    tokenList.add([read_line, [3, ['f', Number(reading)]]]);
                    revert();
                }
                return
            }
            if (reading_state == 'float_expo+') {
                if (is_numeric(chr)) {
                    reading = reading + chr;
                }
                else {
                    tokenList.add([read_line, [3, ['f', Number(reading)]]]);
                    revert();
                }
                return
            }
            if (reading_state == 'float_expo-') {
                if (is_numeric(chr)) {
                    reading = reading + chr;
                    reading_state = 'float_expo+';
                }
                else {
                    ERROR_OCCURED = true;
                    ERR_msg = "Invalid Floating point number"
                }
                return
            }
            if (reading_state == 'float_expo++') {
                if (is_numeric(chr)) {
                    reading = reading + chr;
                    reading_state = 'float_expo+';
                }
                else {
                    ERROR_OCCURED = true;
                    ERR_msg = "Invalid Floating point number"
                }
                return
            }
            if (reading_state == 'float_dot_expo') {
                if (is_numeric(chr)) {
                    reading = reading + chr;
                    reading_state = 'float_dot_expo+';
                }
                else if (chr == '-') {
                    reading = reading + chr;
                    reading_state = 'float_dot_expo-';
                }
                else if (chr == '+') {
                    reading = reading + chr;
                    reading_state = 'float_dot_expo++';
                }
                else {
                    ERROR_OCCURED = true;
                    ERR_msg = "Invalid floating point number"
                }
                return
            }
            if (reading_state == 'float_dot_expo+') {
                if (is_numeric(chr)) {
                    reading = reading + chr;
                }
                else {
                    tokenList.add([read_line, [3, ['f', Number(reading)]]])
                    revert();
                }
                return
            }
            if (reading_state == 'float_dot_expo++') {
                if (is_numeric(chr)) {
                    reading = reading + chr;
                    reading_state = 'float_dot_expo+';
                }
                else {
                    ERROR_OCCURED = true;
                    ERR_msg = "Invalid floating point number"
                }
                return
            }
            if (reading_state == 'float_dot_expo-') {
                if (is_numeric(chr)) {
                    reading = reading + chr;
                    reading_state = 'float_dot_expo+';
                }
                else {
                    ERROR_OCCURED = true;
                    ERR_msg = "Invalid floating point number"
                }
                return
            }
            if (reading_state == 'single_comment') {
                if (chr == '\n') {
                    clear();
                }
                return
            }
            if (reading_state == 'multi_comment') {
                if (chr == '*') {
                    reading = '*';
                }
                else if (chr == '/' && reading == '*') {
                    clear();
                }
                else {
                    reading = '';
                }
                return
            }
            if (reading_state == 'char_escape') {
                if (/^[0-7]$/.test(chr)) {
                    reading_state = 'char_escape1'
                    reading += chr
                }
                else if (chr == 'x' || chr == 'X') {
                    reading_state = 'char_hex'
                    reading += chr
                }
                else if (chr in escape_sequence) {
                    reading_state = 'char_escape_s';
                    reading += chr
                }
                else {
                    reading = "'" + chr;
                    reading_state = 'char+'
                }
                return
            }
            if (reading_state == 'char+') {
                if (chr == "'") {
                    tokenList.add([read_line, [3, ['i', reading.charCodeAt(1)]]])
                    clear()
                }
                else {
                    ERROR_OCCURED = true;
                    ERR_msg = "Invalid character"
                }
                return
            }
            if (reading_state == 'char_escape1') {
                if (/^[0-7]$/.test(chr)) {
                    reading_state = 'char_escape2'
                    reading += chr
                }
                else if (chr = "'") {
                    tokenList.add([read_line, [3, ['i', Number(reading[2])]]])
                    clear()
                }
                else {
                    ERROR_OCCURED = true;
                    ERR_msg = "Invalid Character"
                }
                return
            }
            if (reading_state == 'char_escape2') {
                if (/^[0-7]$/.test(chr)) {
                    reading_state = 'char_escape3'
                    reading += chr
                }
                else if (chr = "'") {
                    tokenList.add([read_line, [3, ['i', 8 * Number(reading[2]) + Number(reading[3])]]])
                    clear()
                }
                else {
                    ERROR_OCCURED = true;
                    ERR_msg = "Invalid Character"
                }
                return
            }
            if (reading_state == 'char_escape3') {
                if (chr = "'") {
                    if (Number(reading[2]) > 1) {
                        ERROR_OCCURED = true
                        ERR_msg = "Out of range Octal Sequence"
                    }
                    else {
                        tokenList.add([read_line, [3, ['i', 64 * Number(reading[2]) + 8 * Number(reading[3]) + Number(reading[4])]]])
                        clear()
                    }
                }
                else {
                    ERROR_OCCURED = true;
                    ERR_msg = "Invalid Character"
                }
                return
            }
            if (reading_state == 'char_escape_s') {
                if (chr == "'") {
                    tokenList.add([read_line, [3, ['i',escape_sequence[reading[2]]]]])
                    clear()
                }
                else {
                    ERROR_OCCURED = true;
                    ERR_msg = "Invalid character"
                }
                return
            }
            if (reading_state == 'char_hex') {
                if (/^[0-9a-fA-F]$/.test(chr)) {
                    reading += chr
                    reading_state = 'char_hex1'
                }
                else {
                    ERROR_OCCURED = true;
                    ERR_msg = "Invalid Hex sequence"
                }
                return
            }
            if (reading_state == 'char_hex1') {
                if (/^[0-9a-fA-F]$/.test(chr)) {
                    reading += chr
                    reading_state = 'char_hex2'
                }
                else if (chr == "'") {
                    tokenList.add([read_line, [3, ['i', hex_digit[reading[3]]]]])
                    clear()
                }
                else {
                    ERROR_OCCURED = true;
                    ERR_msg = "Invalid Hex sequence"
                }
                return
            }
            if (reading_state == 'char_hex2') {
                if (chr == "'") {
                    tokenList.add([read_line, [3, ['i', hex_digit[reading[3]] * 8 + hex_digit[reading[4]]]]])
                    clear()
                }
                else {
                    ERROR_OCCURED = true;
                    ERR_msg = "Invalid Hex sequence"
                }
                return
            }
            //strings
            /* note to future self, 
                1.move the if conditions to a more nested setup,
                    this is to skip the 'none' state character checks
                2.try to make the character checks into a tree for more log(n) run time                    
            */
            if (reading_state == 'string') {
                if (chr == '"') {
                    tokenList.add([read_line, add_string(reading)]);
                    clear();
                }
                else if (chr == '\\') {
                    reading_state = "string_escape"
                }
                else {
                    reading.push(chr.charCodeAt(0));
                }
                return
            }
            if (reading_state == 'string_escape') {
                if (/^[0-7]$/.test(chr)) {
                    reading_state = 'string_escape1'
                    reading.push(Number(chr))
                }
                else if (chr == 'x' || chr == 'X') {
                    reading_state = 'string_hex'
                }
                else if (chr in escape_sequence) {
                    reading.push(escape_sequence[chr])
                    reading_state = "string"
                }
                else if (chr == '"') {
                    ERROR_OCCURED = true;
                    ERR_msg = "Unfinished Escape Sequence"
                }
                else {
                    reading.push(chr.charCodeAt(0));
                    reading_state = 'string'
                }
                return
            }
            if (reading_state == 'string_escape1') {
                if (/^[0-7]$/.test(chr)) {
                    reading.top = reading.top * 8 + Number(chr)
                    reading_state = 'string_escape2'
                }
                else {
                    reading_state = 'string';
                    dfa(chr, line_no)
                }
                return
            }
            if (reading_state == 'string_escape2') {
                if (/^[0-7]$/.test(chr)) {
                    reading.top = reading.top * 8 + Number(chr)
                    reading_state = 'string'
                }
                else {
                    reading_state = 'string';
                    dfa(chr, line_no)
                }
                return
            }
            if (reading_state == 'string_hex') {
                if (/^[0-9a-fA-F]$/.test(chr)) {
                    reading.push(hex_digit[chr])
                    reading_state = 'string_hex+'
                }
                else {
                    ERROR_OCCURED = true
                    ERR_msg = "There are no Hex digits given after \\x"
                }
                return
            }
            if (reading_state == 'string_hex+') {
                if (/^[0-9a-fA-F]$/.test(chr)) {
                    reading.top = (reading.top & 0xF) << 4 | hex_digit[chr]
                }
                else {
                    reading_state = 'string'
                    dfa(chr, line_no)
                }
                return
            }
            ERROR_OCCURED = true
            ERR_msg = "Token not identified"
            return;
        }
        for (let line_no = 0; line_no < lines.length; line_no++) {
            for (let chr_no = 0; chr_no < lines[line_no][1].length; chr_no++) {
                cur_line = line_no
                dfa(lines[line_no][1][chr_no], cur_line)
                if (ERROR_OCCURED) {
                    return { 'error at': [line_no, chr_no], 'error message': ERR_msg }
                }
            }
            dfa('\n', cur_line)
            if (ERROR_OCCURED) {
                return { 'error at': [line_no, lines[line_no][1].length || 0], 'error message': ERR_msg }
            }
        }
        return {
            "tokenList": tokenList,
            "symbolTable": symbolTable
        }
    }
    this.Parser = function (LexerOutput) {

    }
    this.run = async function () {

    }
    this.step = async function () {

    }
    this.stepOver = async function () {

    }
    this.pause = async function () {

    }
    this.stop = async function () {

    }
    this.extra_function = {
        'beep': function () {
            let snd = new Audio("data:audio/mp3;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
            snd.play();
        },
        'debug_token_reader': function (LexerOutput) {
            let k = keywords, o = operators, i = LexerOutput['symbolTable']['identifiers'], out = [];
            for (let _i = 0; _i <= LexerOutput['tokenList'].top[0]; _i++) {
                out.push([])
            }
            for (let _i = 0; _i < LexerOutput['tokenList'].length; _i++) {
                let v = LexerOutput['tokenList'][_i][1];
                let u = LexerOutput['tokenList'][_i][0];
                if (v[0] == 0) {
                    for (let j in k) {
                        if (k[j] == v) {
                            out[u].push(j);
                        }
                    }
                }
                else if (v[0] == 1) {
                    for (let j in o) {
                        if (o[j] == v) {
                            out[u].push(j);
                        }
                    }
                }
                else if (v[0] == 2) {
                    for (let j in i) {
                        if (i[j] == v) {
                            out[u].push(j);
                        }
                    }
                }
                else if (v[0] == 3) {
                    if (v[1][0] == 'i') {
                        out[u].push(v[1][1]);
                    }
                    else if (v[1][0] == 'f') {
                        out[u].push(v[1][1]);
                    }
                }
                else if (v[0] == 4) {
                    for (let j in LexerOutput['symbolTable']['strings']) {
                        if (LexerOutput['symbolTable']['strings'][j] == v) {
                            out[u].push(j);
                        }
                    }
                }
            }
            return out;
        },
        'line_spitter': function (txt) {
            let out = txt.split('\n');
            for (let i = 0; i < out.length; i++) {
                out[i] = [i, out[i]]
            }
            return out;
        }
    }
}
var Interpreter = new __interpreter();