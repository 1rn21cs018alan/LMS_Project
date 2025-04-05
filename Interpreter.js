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
    let __this_obj=this;
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
                    let j=line.indexOf('undef')+6,word='',rpl='';
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
                    return { 'error at': [i, lines[i][1]], 'error message': ERR_msg }
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
            // definition[i].push([-1])
            definition[i].push([last_line+1])
            definition[i].sort((a,b)=>a[0]-b[0])
            // let regions=[];
            for(let j=0;j<definition[i].length-1;j++){
                if(definition[i][j].length==2 && definition[i][j+1].length!==undefined){
                    for(let k=definition[i][j][0];k<definition[i][j+1][0];k++){
                        let temp = "";
                        for(let l=0;l<out[k][1].length;l++){
                            let chr=out[k][1][l];
                            if(temp==''){
                                if(/^[a-zA-Z_]$/.test(chr)){
                                    temp=chr;
                                }
                            }
                            else if(/^[a-zA-Z_]/.test(temp)){
                                if(/^[a-zA-Z0-9_]$/.test(chr)){
                                    temp=temp+chr;
                                }
                                else{
                                    if(temp==i){
                                        out[k][1]=out[k][1].slice(0,l-temp.length)+definition[i][j][1]+out[k][1].slice(l);
                                        l-=temp.length;
                                        l+=definition[i][j][1].length;
                                    }
                                    l--;
                                    temp='';
                                }
                            }
                        }
                    }
                }
            }
        }
        return out;
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
    this.run = async function (_lines) {
        //utilising old interpretter for now
        /*
        Must replace with new interpretter once it's ready
        */
        "use strict";
        Array.prototype.__defineGetter__("top", function () { return this[this.length - 1] })
        String.prototype.__defineGetter__("top", function () { return this[this.length - 1] })
        var Current_Line = -1
        async function interpret(function_start_pointer, scope = 1) {
            const variableExp = "[a-zA-Z_][a-zA-Z0-9_]*"
            for (let i = function_start_pointer; i < Program.length - 1; i++) {
                // render_Variables()
                // render_Memory()
                debugger;
                let line = Program[i].trim()
                let tokens = lineLexer(line)
                if (line === "" || tokens.length === 0) {
                    continue;
                }
                await sleep();
                while (PAUSE_EXEC) {
                    await sleep(300);
                }
                Current_Line = i;
                extra_render_data = { "ExecID": extra_render_data['ExecID'] };
                if (is_var_declaration(tokens)['is_var']) {
                    let var_type = is_var_declaration(tokens)['type']
                    let var_names = [[]]
                    if (tokens[is_var_declaration(tokens)['first variable'] + 1] == '[') {
                        // console.log("detected Array")
                        let array_dim = []
                        let array_size_tokens = []
                        let bracket_balance = 0
                        let j = is_var_declaration(tokens)['first variable'] + 1
                        let var_index = 0;
                        for (; j < tokens.length; j++) {
                            if (tokens[j] == '[') {
                                bracket_balance += 1
                            }
                            else if (tokens[j] == ']') {
                                bracket_balance -= 1
                            }
                            if (bracket_balance == 0) {
                                if (tokens[j] == ']') {
                                    let arr_dim_size = await evaluate(array_size_tokens, scope)
                                    if (arr_dim_size['value'] === undefined) {
                                        arr_dim_size = { "value": getVariableData(arr_dim_size), "type": "int" }
                                    }
                                    array_dim.push(arr_dim_size)
                                    array_size_tokens = []
                                } else {
                                    //array declarations
                                    var_index = createVariable(tokens[is_var_declaration(tokens)['first variable']], { 'dtype': var_type, 'dims': array_dim }, scope)
                                    break;
                                }
                            }
                            else if (tokens[j] == '[' && bracket_balance == 1) {
                                continue
                            }
                            else {
                                array_size_tokens.push(tokens[j])
                            }
                        }
                        //code for array initialization 
                        if (tokens[j] == '=') {
                            let assign_address = { 'addr': Variables[var_index]['addr'], 'type': var_type }
                            if (tokens[j + 1] == '{' && _top(tokens) == ';' && tokens[tokens.length - 2] == '}') {
                                j += 2;
                                let elem_count = array_dim.reduce((a, k, c) => a * k['value'], 1)
                                for (let k = 0; k < elem_count && j < tokens.length; k++, j++) {
                                    let elem_tokens = []
                                    while (tokens[j] != ',' && j < tokens.length) {
                                        if (tokens[j] != '{' || tokens[j] != '}') {
                                            elem_tokens.push(tokens[j])
                                        }
                                        j++;
                                    }
                                    let elem = await evaluate(elem_tokens, scope)
                                    // console.log(elem,elem_tokens,tokens[j])
                                    await evaluate([assign_address, '=', elem], scope)
                                    assign_address['addr'] += size_of(var_type)
                                }
                            }
                            else if (tokens[j + 1] && tokens[j + 1]['type'] == 'string') {
                                // handle strings later
                                let elem_count = array_dim.reduce((a, k, c) => a * k['value'], 1)
                                let str = tokens[j + 1]['value']
                                for (let k = 0; k < elem_count && k < str.length; k++) {
                                    let elem = { 'value': str.charCodeAt(k), 'type': 'char' }
                                    await evaluate([assign_address, '=', elem], scope)
                                    assign_address['addr'] += size_of(var_type)
                                }
                            }
                            else {
                                CrashNotif("Invalid Array Initialization")
                            }
                        }
                    }
                    else {
                        for (let j = is_var_declaration(tokens)['first variable']; j < tokens.length; j++) {
                            if (tokens[j] == ',') {
                                var_names.push([])
                            } else {
                                if (_top(var_names).length == 0 && tokens[j] != "[") {
                                    createVariable(tokens[j], var_type, scope)
                                }
                                if (_top(var_names).length == 1) {
                                    if (tokens[j] == '[') {
                                        // let array_decl = var_names.pop()
                                        // while (tokens[j] != ',') {
                                        //     array_decl.push(token[j])
                                        //     j++;
                                        // }
                                        // var_names.push([])
                                        // //array declaration logic
                                        // createVariable(array_decl[0], var_type + '*', scope)
                                        CrashNotif("Array declaration must be done seperately")
                                    }
                                }
                                _top(var_names).push(tokens[j])
                            }
                        }
                        for (let j = 0; j < var_names.length; j++) {
                            await evaluate(var_names[j], scope)
                        }
                    }
                }
                else if (tokens[0] === '}') {
                    let temp = Branch_stack.top
                    if (temp['keyword'] == 'if' && temp['inner_scope'] == scope) {
                        scope -= 1
                        i = temp['end'] - 1
                        Branch_stack.pop()
                        deallocateOutOfScopeVariables(scope)
                    }
                    else if (temp['keyword'] == 'for' && temp['inner_scope'] == scope) {
                        deallocateOutOfScopeVariables(scope - 1)
                        await evaluate(temp['update_exp'], scope + 1)

                        let pass = await evaluate(temp['test_exp'], scope - 1)
                        // console.log(pass)
                        if (pass === undefined) {
                            deallocateOutOfScopeVariables(scope - 1)
                            i = temp['start'] - 1
                        }
                        else {
                            if (pass['value'] === undefined) {
                                pass = { 'value': getVariableData(pass) }
                            }
                            if (pass['value'] == 0) {

                                Branch_stack.pop()
                                scope -= 2
                                deallocateOutOfScopeVariables(scope)
                                i = temp['end'] - 1
                            }
                            else {
                                deallocateOutOfScopeVariables(scope - 1)
                                i = temp['start'] - 1
                            }
                        }
                    }
                    else if (temp['keyword'] === 'function' && temp['scope'] == scope) {
                        //return functionality
                        if (functions[temp['name']]['return_type'] == 'void') {
                            return
                        }
                        if (typeof (temp['type']) == 'string' && (temp['type'].indexOf('struct') == -1 || temp['type'].top == '*')) {
                            return { 'type': temp['type'], 'value': 0 }
                        }
                        CrashNotif("No Return Value Given")
                    }
                }
                else if (tokens[0] == "if") {
                    // console.log("if condition detected")
                    //get expression in if
                    if (/^\s*if\s*\(.*\)\s*\{\s*$/.test(line)) {
                        // console.log("valid if")
                    }
                    let exp = line.slice(line.indexOf('(')).split('{', 1)[0]
                    // console.log(exp)
                    let pass = await evaluate(exp, scope)
                    // console.log(pass)
                    let if_code = getContainer(i, Program[i].indexOf("{"))
                    // console.log(if_code)
                    let If_data = { "keyword": "if", "else": undefined, "end": if_code["end"][0] + 1, "inner_scope": scope + 1 }
                    if (Program[If_data["end"]].includes("else")) {
                        let j = If_data["end"]
                        If_data["else"] = j
                        while (Program[j].includes("else if")) {
                            let elif_code = getContainer(j, Program[j].indexOf("{"))
                            j = elif_code["end"][0] + 1
                            If_data["end"] = j
                        }
                        if (Program[j].includes("else")) {
                            let else_code = getContainer(j, Program[j].indexOf("{"))
                            If_data["end"] = else_code["end"][0] + 1
                        }
                    }
                    Branch_stack.push(If_data)
                    if (pass['value'] === undefined) {
                        pass = { 'value': getVariableData(pass) }
                    }
                    if (pass['value'] == 0) { //did not enter if condition
                        // console.log("failed")
                        if (If_data["else"] === undefined) {
                            i = If_data["end"] - 1
                            Branch_stack.pop()
                        }
                        else {
                            i = If_data["else"] - 1
                        }
                    }
                    else {//entered if condition
                        scope += 1
                        // console.log("passed")
                    }

                }
                else if (tokens[0] == "else") {
                    let temp = Branch_stack[Branch_stack.length - 1]
                    if (temp === undefined) {
                        CrashNotif({ "error word": "No if condition detected" })
                        return
                    }

                    if (temp["keyword"] != "if") {
                        CrashNotif({ "error word": "No if condition detected" })
                        return
                    }

                    if (temp["inner_scope"] == scope + 1) {
                        if (Program[i].includes("if")) {
                            let code = getContainer(i, Program[i].indexOf("{"))
                            temp['else'] = undefined
                            if (Program[code['end'][0] + 1].includes("else")) {
                                temp['else'] = code['end'][0] + 1
                            }
                            let exp = Program[i].slice(Program[i].indexOf('('), code['start'][1])
                            // console.log(exp)
                            let pass = await evaluate(exp, scope)
                            // console.log(pass)
                            if (pass === undefined) {
                                pass = { 'value': 1 }
                            }
                            if (pass['value'] === undefined) {
                                pass = { 'value': getVariableData(pass) }
                            }
                            if (pass['value'] == 0) { //did not enter if condition
                                // console.log("failed")
                                if (temp["else"] === undefined) {
                                    i = temp["end"] - 1
                                    Branch_stack.pop()
                                }
                                else {
                                    i = temp["else"] - 1
                                }
                            }
                            else {//entered if condition
                                scope += 1
                                // console.log("passed")
                            }

                        }
                        else {
                            temp['else'] = undefined
                            scope += 1
                        }
                    }
                    else {
                        CrashNotif({ "error word": "No if condition deteted" })
                        return
                    }

                }
                else if (tokens[0] == "for") {
                    if (/^\s*for\s*\(.*;.*;.*\)\s*\{\s*$/.test(line)) {
                        let init_exp = line.slice(line.indexOf('(') + 1, line.indexOf(';'))
                        let test_exp = line.slice(line.indexOf(';') + 1, line.lastIndexOf(';'))
                        let update_exp = line.slice(line.lastIndexOf(';') + 1, line.lastIndexOf(')'))
                        let for_code = getContainer(i, Program[i].indexOf('{'))
                        if (for_code == undefined) {
                            CrashNotif({ "error word": "For loop syntax error" })
                            return
                        }
                        let for_data = { "keyword": "for", "start": i + 1, "end": for_code['end'][0] + 1, "test_exp": test_exp, "update_exp": update_exp, "inner_scope": scope + 2 }
                        Branch_stack.push(for_data)
                        if (is_var_declaration(lineLexer(init_exp + ';'))['is_var']) {
                            let temp_tokens = lineLexer(init_exp + ';')
                            let var_type = is_var_declaration(temp_tokens)['type']
                            let var_names = [[]]
                            for (let j = is_var_declaration(temp_tokens)['first variable']; j < temp_tokens.length; j++) {
                                if (temp_tokens[j] == ',') {
                                    var_names.push([])
                                } else {
                                    if (_top(var_names).length == 0) {
                                        createVariable(temp_tokens[j], var_type, scope + 1)
                                    }
                                    _top(var_names).push(temp_tokens[j])
                                }
                            }
                            for (let j = 0; j < var_names.length; j++) {
                                await evaluate(var_names[j], scope + 1)
                            }
                        }
                        else {
                            await evaluate(lineLexer(init_exp), scope + 1)
                        }
                        let pass = await evaluate(test_exp, scope + 1)
                        if (pass === undefined) {
                            scope += 2
                        }
                        else {
                            if (pass['value'] === undefined) {
                                pass = { 'value': getVariableData(pass) }
                            }
                            if (pass['value'] == 0) {

                                //exit before start
                                Branch_stack.pop()
                                deallocateOutOfScopeVariables(scope)
                                i = for_code['end'][0]
                            }
                            else {
                                //enter loop
                                scope += 2
                            }
                        }
                    }
                    else {
                        CrashNotif({ 'error word': "for loop syntax is wrong" })
                        return
                    }
                }
                else if (tokens[0] == "while") {
                    let test_exp = line.slice(line.indexOf('('), line.lastIndexOf('{'))
                    let loop_code = getContainer(i, Program[i].indexOf('{'))
                    if (loop_code == undefined) {
                        CrashNotif({ "error word": "While loop syntax error" })
                        return
                    }
                    let for_data = { "keyword": "for", "start": i + 1, "end": loop_code['end'][0] + 1, "test_exp": test_exp, "update_exp": "1", "inner_scope": scope + 2 }
                    Branch_stack.push(for_data)
                    let pass = await evaluate(test_exp, scope + 1)
                    if (pass === undefined) {
                        scope += 2
                    }
                    else {
                        if (pass['value'] === undefined) {
                            pass = { 'value': getVariableData(pass) }
                        }
                        if (pass['value'] == 0) {
                            //exit before start
                            Branch_stack.pop()
                            deallocateOutOfScopeVariables(scope)
                            i = loop_code['end'][0]
                        }
                        else {
                            //enter loop
                            scope += 2
                        }
                    }
                }
                else if (tokens[0] == "do") {
                    let loop_code = getContainer(i, Program[i].indexOf('{'))
                    if (loop_code == undefined) {
                        CrashNotif({ "error word": "do while loop syntax error" })
                        return
                    }
                    else if (!(/^\s*\}\s*while\s*\([\S\s]*\)\s*;\s*$/.test(Program[loop_code['end'][0]]))) {
                        CrashNotif({ "error word": "do while loop syntax error" })
                        return
                    }
                    line = Program[loop_code['end'][0]]
                    let test_exp = line.slice(line.indexOf('('), line.lastIndexOf(';'))
                    let for_data = { "keyword": "for", "start": i + 1, "end": loop_code['end'][0] + 1, "test_exp": test_exp, "update_exp": "1", "inner_scope": scope + 2 }
                    Branch_stack.push(for_data)
                    scope += 2
                }
                else if (tokens[0] == 'break') {
                    if (/^\s*break\s*;\s*$/.test(Program[i])) {
                        for (let j = Branch_stack.length - 1; j >= 0; j--) {
                            if (Branch_stack[j]['keyword'] == 'for') {
                                i = Branch_stack[j]['end'] - 1
                                scope = Branch_stack[j]['inner_scope'] - 2
                                deallocateOutOfScopeVariables(scope)
                                break;
                            }
                            else {
                                Branch_stack.pop()
                            }
                        }
                    }
                }
                else if (tokens[0] == 'continue') {
                    if (/^\s*continue\s*;\s*$/.test(Program[i])) {
                        for (let j = Branch_stack.length - 1; j >= 0; j--) {
                            if (Branch_stack[j]['keyword'] == 'for') {
                                i = Branch_stack[j]['end'] - 2
                                scope = Branch_stack[j]['inner_scope']
                                break;
                            }
                            else {
                                Branch_stack.pop()
                            }
                        }
                    }
                }
                else if (tokens[0] == 'return') {
                    debugger;
                    let returnValue = await evaluate(tokens.slice(1), scope);
                    while (Branch_stack.top && Branch_stack.top['keyword'] != 'function') {
                        Branch_stack.pop();
                    }
                    let type = functions[Branch_stack.top['name']]['return_type'];
                    if(type=="void"){
                        return
                    }
                    if (returnValue['type'] == type) {
                        return returnValue;
                    }
                    switch (type) {
                        case 'void':
                            return undefined
                        case 'int':
                            return { 'type': type, 'value': TypeCastInt(returnValue) }
                        case 'char':
                            return { 'type': type, 'value': TypeCastChar(returnValue) }
                        case 'float':
                            return { 'type': type, 'value': TypeCastFloat(returnValue) }
                    }
                    if (type.indexOf('*') != -1) {
                        return { 'type': type, 'value': TypeCastPointer(returnValue) }
                    }
                    CrashNotif("TypeCasting " + returnValue['type'] + " to " + type + "is not possible")
                }
                else if (_top(tokens) == ';') {
                    await evaluate(tokens, scope)
                }
                else {
                    CrashNotif("Not a valid line")
                    return
                }
            }
        }
        async function evaluate(tokens, scope) {
            if (scope === undefined) {
                CrashNotif({ "error word": 'Scope Not Given' })
                return
            }
            if (typeof (tokens) == 'string') {
                tokens = lineLexer(tokens)
            }
            let result = undefined
            /*
                parse mode values
                0=Not Started reading value
                1=reading either a variable or function
                2=reading a function's parameters
            */
            let parse_mode = 0;
            let temp = undefined
            let operator = undefined
            let negativeFlag = false
            let postfix_stack = []
            let operation_stack = ['#']
            function is_identifier(x) {
                if (x === undefined || x === "sizeof" || DataTypes.indexOf(x) != -1) return false
                return /^[_a-zA-Z][_a-zA-Z0-9]*$/.test(x)
            }
            let F = function (s) {
                switch (s) {
                    case ',': return 1;
                    case '=':
                    case '+=':
                    case '-=':
                    case '*=':
                    case '/=':
                    case '%=': return 2;
                    case '||': return 3;
                    case '&&': return 4;
                    case '==':
                    case '!=': return 5;
                    case '>':
                    case '<':
                    case '>=':
                    case '<=': return 6;
                    case '+':
                    case '-': return 7;
                    case '*':
                    case '%':
                    case '/': return 8;
                    case '&':
                    case '*deref':
                    case '++pre':
                    case '+unary':
                    case '--pre':
                    case '-unary':
                    case '(float)':
                    case '(char)':
                    case '(int)':
                    case '(float*)':
                    case '(char*)':
                    case '(int*)':
                    case '(float**)':
                    case '(char**)':
                    case '(int**)':
                    case "(struct sll*)":
                    case "(struct dll*)":
                    case "(struct stack*)":
                    case "(struct queue*)":
                    case "(struct tree*)":
                    case 'sizeof':
                    case '!': return 9;
                    case '#': return -1;
                    case '++post':
                    case '--post':
                    case '->':
                    case '.': return 11;
                    case '[':
                    case '(': return 12;
                    case ']':
                    case ')': return 0;
                    default: return 10;
                }
            }
            let is_right_associative = function (s) {
                switch (s) {
                    case '++pre':
                    case '--pre':
                    case '-unary':
                    case '+unary':
                    case '*deref':
                    case 'sizeof':
                    case '!':
                    case '&':
                    case '(float)':
                    case '(char)':
                    case '(int)':
                    case '(float*)':
                    case '(char*)':
                    case '(int*)':
                    case '(float**)':
                    case '(char**)':
                    case '(int**)':
                    case "(struct sll*)":
                    case "(struct dll*)":
                    case "(struct stack*)":
                    case "(struct queue*)":
                    case "(struct tree*)":
                    case '=':
                    case '+=':
                    case '-=':
                    case '*=':
                    case '/=':
                    case '%=':
                        return true;
                    default: return false
                }
            }
            let conv = async function (elem) {
                debugger;
                if (F(elem) == F("abc")) {
                    postfix_stack.push(elem)
                    return;
                }
                if (_top(operation_stack) == "." || _top(operation_stack) == '->') {
                    postfix_push(operation_stack.pop());
                }
                if (elem == '(' || elem == '[') {
                    operation_stack.push(elem)
                    return;
                }
                while ((F(_top(operation_stack)) > F(elem))) {
                    let temp3 = operation_stack.pop()
                    if (temp3 == '(' && elem == ')') {
                        if (_top(operation_stack) != undefined && typeof (_top(operation_stack)) == 'object') {
                            if (_top(operation_stack)['type'] == 'func') {
                                let func = operation_stack.pop();
                                let name = func['name']
                                // let args=_top(postfix_stack)
                                let args = postfix_stack.pop()
                                if (!args.hasOwnProperty('length')) {
                                    args = [args]
                                }
                                for (let i = 0; i < args.length; i++) {
                                    if (args[i]['value'] === undefined) {
                                        if (args[i]['type']['dtype']) {
                                            args[i] = { 'value': args[i]['addr'], 'type': (args[i]['type']['dtype'] + '*') }
                                        }
                                        else {
                                            args[i] = { 'value': getMemoryData(args[i]['addr']), 'type': args[i]['type'] }
                                        }
                                    }
                                }
                                if (name == 'printf') {
                                    if (args.length == 0) {
                                        CrashNotif("printf function requires at least one parameter")
                                        return;
                                    }
                                    let temp = { 'value': printf(args[0], args.slice(1)), 'type': 'int' }
                                    postfix_stack.push(temp)
                                }
                                else if (name == 'scanf') {
                                    if (args.length == 0) {
                                        CrashNotif("scanf function requires at least one parameter")
                                        return;
                                    }
                                    let temp = { 'value': await scanf(args[0], args.slice(1)), 'type': 'int' }
                                    postfix_stack.push(temp)
                                }
                                else if (name == 'malloc') {
                                    if (args.length != 1) {
                                        CrashNotif("invalid number of parameters for malloc function")
                                        return;
                                    }
                                    args[0] = TypeCastInt(args[0])
                                    if (args[0] == undefined) {
                                        CrashNotif("unsupported parameter for malloc function")
                                        return
                                    }
                                    let temp = { 'value': malloc(args[0]), 'type': 'void*' }
                                    postfix_stack.push(temp)
                                }
                                else if (name == 'calloc') {
                                    if (args.length != 2) {
                                        CrashNotif("invalid number of parameters for calloc function")
                                    }
                                    args[0] = TypeCastInt(args[0])
                                    if (args[0] == undefined) {
                                        CrashNotif("unsupported parameter for calloc function")
                                        return
                                    }
                                    args[1] = TypeCastInt(args[1])
                                    if (args[1] == undefined) {
                                        CrashNotif("unsupported parameter for calloc function")
                                        return
                                    }
                                    else {
                                        let temp = { 'value': calloc(args[0], args[1]), 'type': 'void*' }
                                        postfix_stack.push(temp)
                                    }
                                }
                                else if (name == 'realloc') {
                                    if (args.length != 2) {
                                        CrashNotif("invalid number of parameters for realloc function")
                                    }
                                    args[0] = TypeCastPointer(args[0])
                                    if (args[0] == undefined) {
                                        CrashNotif("unsupported parameter for realloc function")
                                        return
                                    }
                                    args[1] = TypeCastInt(args[1])
                                    if (args[1] == undefined) {
                                        CrashNotif("unsupported parameter for realloc function")
                                        return
                                    }
                                    else {
                                        let unwrap = function (obj) {
                                            let unwrapped_memory = {}
                                            for (let i in obj) {
                                                if (typeof (obj[i]) != "object") {
                                                    unwrapped_memory[i] = obj[i]
                                                }
                                                else {
                                                    let inner_wrap = unwrap(obj[i])
                                                    for (let j in inner_wrap) {
                                                        unwrapped_memory[Number(i) + Number(j)] = inner_wrap[j]
                                                    }
                                                }
                                            }
                                            return unwrapped_memory
                                        }
                                        if (args[0] in Memory && args[0] > 6000) {
                                            // block exists
                                            let size = Memory[args[0]]['size']
                                            let unwrapped_memory = unwrap(Memory[args[0]]['value'])
                                            if (size >= args[1]) {
                                                //reduce block size
                                                let res_memory = {}
                                                for (let i in unwrapped_memory) {
                                                    if (i < size) {
                                                        res_memory[i] = unwrapped_memory[i]
                                                    }
                                                }
                                                Memory[args[0]]['value'] = res_memory
                                                Memory[args[0]]['size'] = args[1]
                                                let temp = { 'value': args[0], 'type': 'void*' }
                                                postfix_stack.push(temp)
                                            } else {
                                                //new block
                                                let temp = { 'value': malloc(args[1]), 'type': 'void*' }
                                                postfix_stack.push(temp)
                                                Memory[temp['value']]['value'] = JSON.parse(JSON.stringify(unwrapped_memory));
                                                free_mem(args[0])
                                            }
                                        }
                                        else if (args[0] == 0) {
                                            // basically malloc
                                            let temp = { 'value': malloc(args[1]), 'type': 'void*' }
                                            postfix_stack.push(temp)
                                        }
                                        else {
                                            //invalid memory
                                            let temp = { 'value': 0, 'type': 'void*' }
                                            postfix_stack.push(temp)
                                        }
                                    }
                                }
                                else if (name == 'free') {
                                    if (args.length != 1) {
                                        CrashNotif("invalid number of parameters for free function")
                                    }
                                    args[0] = TypeCastPointer(args[0])
                                    if (args[0] == undefined) {
                                        CrashNotif("unsupported parameter for free function")
                                        return
                                    }
                                    free_mem(args[0])
                                }
                                else if (name == 'exit') {
                                    if (args.length != 1) {
                                        CrashNotif("invalid number of parameters for exit function")
                                    }
                                    args[0] = TypeCastInt(args[0])
                                    if (args[0] == undefined) {
                                        CrashNotif("unsupported parameter for exit function")
                                        return
                                    }
                                    CrashNotif({ 'error word': "Program exitted with exit code ( " + args[0] + " )", 'msg_type': 'safe' })
                                    return;
                                }
                                else if (name in functions) {
                                    // console.log("exists")
                                    //udf
                                    let line_to_jump = functions[name]['line'] + 1
                                    Branch_stack.push({ 'keyword': 'function', "name": name, 'scope': scope + 1 })
                                    for (let i = 0; i < functions[name]['parameters'].length; i++) {
                                        createVariable(functions[name]['parameters'][i]['name'], functions[name]['parameters'][i]['type'], scope + 1)
                                    }
                                    for (let i = functions[name]['parameters'].length - 1; i >= 0; i--) {
                                        await evaluate([functions[name]['parameters'][i]['name'], '=', args[i]], scope + 1);
                                    }
                                    let t = await interpret(line_to_jump, scope + 1);
                                    Branch_stack.pop();
                                    //I'll handle structure-return-type shennanigans later
                                    if (functions[name]['return_type'] != 'void') {
                                        if (t['value'] === undefined) {
                                            if (t['type'].indexOf("struct") == -1 || t['type'].top == '*') {
                                                t = { 'type': t['type'], value: getMemoryData(t['addr']) }
                                            }
                                        }
                                        postfix_stack.push(t);
                                    }
                                    else if (t !== undefined) {
                                        CrashNotif("void functions do not return values")
                                    }
                                    deallocateOutOfScopeVariables(scope)
                                }
                            }
                        }
                        return;
                    } else if (temp3 == '[' && elem == ']') {
                        //pointer logic
                        let temp = postfix_stack.pop();
                        if (temp['type'] != 'int') {
                            CrashNotif("Index must be integer")
                            return
                        }
                        let index = temp['value']
                        if (index === undefined) {
                            index = getVariableData(temp)
                        }
                        let temp2 = postfix_stack.pop();
                        if (temp2['type'] !== undefined) {
                            if (temp2['type']['dtype'] !== undefined) {
                                //array with index
                                let elem_dim = [];
                                let elem_size = size_of(temp2['type']['dtype']);
                                let result = { 'addr': temp2['addr'], 'type': { 'dtype': temp2['type']['dtype'], 'dims': elem_dim } }
                                for (let i = 1; i < temp2['type']['dims'].length; i++) {
                                    elem_size *= temp2['type']['dims'][i]['value']
                                    elem_dim.push({ 'value': temp2['type']['dims'][i]['value'], 'type': 'int' })
                                }
                                result['addr'] += elem_size * index
                                if (elem_dim.length == 0) {
                                    result['type'] = temp2['type']['dtype']
                                }
                                postfix_stack.push(result)
                            }
                            else if (temp2['type'].indexOf('*') !== -1) {
                                // pointer with index   
                                let elem_size = size_of(temp2['type'].slice(0, -1))
                                let final_pointer = getVariableData(temp2) + elem_size * index
                                // console.log(final_pointer)
                                let accessed_variable = { 'addr': final_pointer, 'type': temp2['type'].slice(0, -1) }
                                postfix_stack.push(accessed_variable)
                            }
                            else {
                                CrashNotif("Index can only be given for pointer or array type")
                                return
                            }
                        }

                        return;
                    } else if (temp3 == '(' || temp3 == '[') {
                        operation_stack.push(temp3)
                        operation_stack.push(elem)
                        return;
                    }
                    postfix_push(temp3)
                }
                if (F(_top(operation_stack)) != F(elem)) {
                    operation_stack.push(elem);
                }
                else {
                    if (is_right_associative(elem)) {
                        operation_stack.push(elem)
                    }
                    else {
                        let temp3 = operation_stack.pop()
                        postfix_push(temp3)
                        operation_stack.push(elem)
                    }
                }
            }
            let resolveTypes = function (type1, type2) {
                if (type1 == type2) {
                    return type1
                }
                if (type1['dtype'] !== undefined && type2['dtype'] !== undefined) {
                    if (type1['dtype'] == type2['dtype']) {
                        if (type1['dims'].length == type2['dims'].length) {
                            let i = 0
                            for (; i < type1['dims'].length; i++) {
                                if (type1['dims'][i]['value'] != type2['dims'][i]['value']) {
                                    break
                                }
                            }
                            if (i == type1['dims'].length) return JSON.parse(JSON.stringify(type1));
                        }
                    }
                }
                if ((type1 == "float" && (type2 == 'char' || type2 == 'int')) ||
                    (type2 == "float" && (type1 == 'char' || type1 == 'int'))) {
                    return "float"
                }
                if ((type1 == 'int' && type2 == 'char') ||
                    (type2 == 'int' && type1 == 'char')) {
                    return 'int'
                }
                if (type1 == 'float' || type2 == 'float') {
                    CrashNotif({ "error word": "Incompatible types" })
                }
                if (type1 == 'int' || type1 == 'char') {
                    return type2;
                }
                else if (type2 == 'int' || type2 == 'char') {
                    return type1
                }
                if ((type1 == 'int' || type1 == 'char') && (_top(type2) == '*' || type2['dtype'] !== undefined)) {
                    return type2
                } else if ((type2 == 'int' || type2 == 'char') && (_top(type1) == '*' || type1['dtype'] !== undefined)) {
                    return type1
                }
                CrashNotif({ "error word": "Incompatible types" })
            }
            let postfix_push = function (elem) {
                let op1 = postfix_stack.pop(), op2 = undefined, temp_res = { 'value': 0, 'type': "float" }
                let is_pointer = function (elem) {
                    if (elem === undefined) return false
                    if (elem['type'] === undefined) return false
                    if (_top(elem['type']) === '*') return true
                    if (elem['type']['dtype'] !== undefined) return true
                    return false
                }
                // if (typeof (op1) != 'object') {
                //     op1 = Variables[getVariableIndex(op1, scope)]
                //     if (op1 === undefined) {
                //         CrashNotif({ "error word": "Invalid Variable" })
                //         return
                //     }
                // }
                switch (elem) {
                    case '&':
                        temp_res['value'] = op1['addr']
                        if (temp_res['value'] === undefined) {
                            CrashNotif({ "error word": "Invalid Variable" })
                        }
                        temp_res['type'] = op1['type'] + '*'
                        postfix_stack.push(temp_res)
                        break;
                    case '*deref':
                        if (op1['addr'] === undefined) {
                            temp_res['addr'] = op1['value']
                        }
                        else {
                            temp_res['addr'] = getVariableData(op1)
                        }
                        if (temp_res['addr'] === undefined) {
                            CrashNotif({ "error word": "Invalid Variable" })
                        }
                        if (_top(op1['type']) == '*') {
                            temp_res['type'] = op1['type'].slice(0, -1)
                        }
                        else {
                            CrashNotif("Dereferencing a Non-Pointer")
                            return;
                        }
                        postfix_stack.push(temp_res)
                        break;
                    case '++pre':
                        if (op1['addr'] === undefined) {
                            CrashNotif("Incrementing temporary variables is not possible")
                            return
                        }
                        else if (op1['type']['dtype'] !== undefined) {
                            CrashNotif("Incrementing constant pointer is not possible")
                            return
                        }
                        else {
                            temp_res = { 'value': getVariableData(op1), 'type': op1['type'] }
                            if (_top(op1['type']) != '*') {
                                temp_res['value'] = TypeCastFloat(temp_res) + 1
                            }
                            else {
                                temp_res['value'] = temp_res['value'] + size_of(op1['type'].slice(0, -1))
                            }
                            setVariableData(op1, temp_res['value'])
                        }
                        postfix_stack.push(temp_res)
                        break;
                    case '+unary':
                        // if (op1['addr'] === undefined) {
                        //     temp_res['value'] = op1['value']
                        // }
                        // else {
                        //     temp_res['value'] = getVariableData(op1)
                        // }
                        // temp_res['type']=op1['type']
                        // if(op['type']=='char'){
                        //     temp_res['type']='char'
                        //     temp_res['value']=TypeCastInt(temp_res)
                        //     temp_res['type']='int'
                        // }
                        // temp_res['value']=-temp_res['value']
                        // if (_top(op1['type']) == '*') {
                        //     temp_res['type'] = op1['type'].slice(0, -1)
                        // }
                        // else {
                        //     CrashNotif("Dereferencing a Non-Pointer")
                        //     return;
                        // }
                        // postfix_stack.push(temp_res)
                        postfix_stack.push(op1)
                        break;
                    case '--pre':
                        if (op1['addr'] === undefined) {
                            CrashNotif("Incrementing temporary variables is not possible")
                            return
                        }
                        else if (op1['type']['dtype'] !== undefined) {
                            CrashNotif("Incrementing constant pointer is not possible")
                            return
                        }
                        else {
                            temp_res = { 'value': getVariableData(op1), 'type': op1['type'] }
                            if (_top(op1['type']) != '*') {
                                temp_res['value'] = TypeCastFloat(temp_res) - 1
                            }
                            else {
                                temp_res['value'] = temp_res['value'] - size_of(op1['type'].slice(0, -1))
                            }
                            setVariableData(op1, temp_res['value'])
                        }
                        postfix_stack.push(temp_res)
                        break;
                    case '-unary':
                        if (op1['addr'] === undefined) {
                            temp_res['value'] = op1['value']
                        }
                        else {
                            temp_res['value'] = getVariableData(op1)
                        }
                        temp_res['type'] = op1['type']
                        if (op1['type'] == 'char') {
                            temp_res['type'] = 'char'
                            temp_res['value'] = TypeCastInt(temp_res)
                            temp_res['type'] = 'int'
                        }
                        temp_res['value'] = -temp_res['value']
                        postfix_stack.push(temp_res)
                        break;
                    case '(float)':
                        if (op1['type'] == 'float' ||
                            op1['type'] == 'int' ||
                            op1['type'] == 'char'
                        ) {
                            if (op1['addr'] !== undefined) {
                                op1 = { 'type': op1['type'], 'value': getVariableData(op1) }
                            }
                            temp_res['value'] = TypeCastFloat(op1)
                            temp_res['type'] = 'float'
                            postfix_stack.push(temp_res)
                        }
                        else if (_top(op1['type']) == '*') {
                            if (op1['addr'] !== undefined) {
                                op1 = { 'type': op1['type'], 'value': getVariableData(op1) }
                            }
                            temp_res['value'] = op1['value']
                            temp_res['type'] = 'float'
                        }
                        else {
                            CrashNotif("cant convert this type to float")
                            return;
                        }
                        break;
                    case '(char)':
                        if (op1['type'] == 'float' ||
                            op1['type'] == 'int' ||
                            op1['type'] == 'char'
                        ) {
                            if (op1['addr'] !== undefined) {
                                op1 = { 'type': op1['type'], 'value': getVariableData(op1) }
                            }
                            temp_res['value'] = TypeCastChar(op1)
                            temp_res['type'] = 'float'
                            postfix_stack.push(temp_res)
                        }
                        else if (_top(op1['type']) == '*') {
                            if (op1['addr'] !== undefined) {
                                op1 = { 'type': op1['type'], 'value': getVariableData(op1) }
                            }
                            temp_res['value'] = TypeCastChar({ 'value': op1['value'], "type": 'int' })
                            temp_res['type'] = 'char'
                        }
                        else {
                            CrashNotif("cant convert this type to char")
                            return;
                        }
                        break;
                    case '(int)':
                        if (op1['type'] == 'float' ||
                            op1['type'] == 'int' ||
                            op1['type'] == 'char'
                        ) {
                            if (op1['addr'] !== undefined) {
                                op1 = { 'type': op1['type'], 'value': getVariableData(op1) }
                            }
                            temp_res['value'] = TypeCastInt(op1)
                            temp_res['type'] = 'int'
                            postfix_stack.push(temp_res)
                        }
                        else if (_top(op1['type']) == '*') {
                            if (op1['addr'] !== undefined) {
                                op1 = { 'type': op1['type'], 'value': getMemoryData(op1['addr']) }
                            }
                            temp_res['value'] = op1['value']
                            temp_res['type'] = 'int'
                        }
                        else {
                            CrashNotif("cant convert this type to int")
                            return;
                        }
                        break;
                    case '(float*)':
                    case '(char*)':
                    case '(int*)':
                    case '(float**)':
                    case '(char**)':
                    case '(int**)':
                    case "(struct sll*)":
                    case "(struct dll*)":
                    case "(struct stack*)":
                    case "(struct queue*)":
                    case "(struct tree*)":
                        temp_res['type'] = elem.slice(1, -1)
                        if (op1['type'] == 'int' ||
                            op1['type'] == 'float' ||
                            op1['type'] == 'char'
                        ) {
                            if (op1['addr'] !== undefined) {
                                op1 = { 'value': getMemoryData(op1['addr']), 'type': op1['type'] }
                            }
                            temp_res['value'] = TypeCastInt(op1)
                            postfix_stack.push(temp_res)
                            return;
                        }
                        else if (typeof (op1['type']) == 'string' && _top(op1['type']) == '*') {
                            if (op1['addr'] !== undefined) {
                                op1 = { 'value': getMemoryData(op1['addr']), 'type': op1['type'] }
                            }
                            temp_res['value'] = op1['value']
                            postfix_stack.push(temp_res)
                            return;
                        }
                        else if (typeof (op1['type']) == 'object' && op1['dtype'] !== undefined) {
                            temp_res['value'] = op1['addr']
                            postfix_stack.push(temp_res)
                            return;
                        }
                        else {
                            CrashNotif("Cant type cast to pointer")
                            return;
                        };
                    case 'sizeof':
                        temp_res['type'] = 'int'
                        if (typeof (op1) == 'string') {
                            temp_res['value'] = size_of(op1)
                        } else {
                            temp_res['value'] = size_of(op1['type'])
                        }
                        postfix_stack.push(temp_res)
                        break;
                    case '!':
                        if (op1['addr'] === undefined) {
                            temp_res['value'] = op1['value']
                        }
                        else {
                            temp_res['value'] = getVariableData(op1)
                        }
                        temp_res['type'] = op1['type']
                        if (op1['type'] == 'char') {
                            temp_res['type'] = 'char'
                            temp_res['value'] = TypeCastInt(temp_res)
                            temp_res['type'] = 'int'
                        }
                        if (temp_res['value'] == 0) {
                            temp_res['value'] = 1
                        } else {
                            temp_res['value'] = 0
                        }
                        postfix_stack.push(temp_res)
                        break;
                    case '++post':
                        if (op1['addr'] === undefined) {
                            CrashNotif("Incrementing temporary variables is not possible")
                            return
                        }
                        else if (op1['type']['dtype'] !== undefined) {
                            CrashNotif("Incrementing constant pointer is not possible")
                            return
                        }
                        else {
                            temp_res = { 'value': getVariableData(op1), 'type': op1['type'] }
                            if (_top(op1['type']) != '*') {
                                setVariableData(op1, TypeCastFloat(temp_res) + 1)
                            }
                            else {
                                setVariableData(op1, temp_res['value'] + size_of(op1['type'].slice(0, -1)))
                            }
                        }
                        postfix_stack.push(temp_res)
                        break;
                    case '--post':
                        if (op1['addr'] === undefined) {
                            CrashNotif("Incrementing temporary variables is not possible")
                            return
                        }
                        else if (op1['type']['dtype'] !== undefined) {
                            CrashNotif("Incrementing constant pointer is not possible")
                            return
                        }
                        else {
                            temp_res = { 'value': getVariableData(op1), 'type': op1['type'] }
                            if (_top(op1['type']) != '*') {
                                setVariableData(op1, TypeCastFloat(temp_res) - 1)
                            }
                            else {
                                setVariableData(op1, temp_res['value'] - size_of(op1['type'].slice(0, -1)))
                            }
                        }
                        postfix_stack.push(temp_res)
                        break;
                    //binary operators
                    default:
                        op2 = op1
                        op1 = postfix_stack.pop()
                        if (op1 === undefined) {
                            CrashNotif("undefined value came up")
                            return
                        }
                        if (typeof (op1) != 'object') {
                            op1 = Variables[getVariableIndex(op1, scope)]
                            if (op1 === undefined) {
                                CrashNotif({ "error word": "Invalid Variable" })
                                return
                            }
                        }
                        switch (elem) {
                            case '=':
                                if (op1['addr'] === undefined) {
                                    CrashNotif("Setting temporary variables is not possible")
                                    return
                                }
                                if (op2['addr'] !== undefined) {
                                    let typ = op2['type'];
                                    if (typ['dtype']) {
                                        op2 = { "value": op2['addr'], 'type': op2['type'] }
                                    }
                                    else if (typ.indexOf("struct") != -1 && typ.top != '*') {

                                    }
                                    else {
                                        op2 = { "value": getVariableData(op2), 'type': op2['type'] }
                                    }
                                }
                                if (op1['type'] === 'int') {
                                    if (op2['type'] == 'int' ||
                                        op2['type'] == 'float' ||
                                        op2['type'] == 'char'
                                    ) {
                                        temp_res['value'] = TypeCastInt(op2)
                                    } else if (_top(op2['type']) == '*' || op2['type']['dtype'] !== undefined) {
                                        temp_res['value'] = op2['value']
                                    } else {
                                        CrashNotif("Unsupported type")
                                        return
                                    }
                                } else if (op1['type'] === 'float') {
                                    if (op2['type'] == 'int' ||
                                        op2['type'] == 'float' ||
                                        op2['type'] == 'char'
                                    ) {
                                        temp_res['value'] = TypeCastFloat(op2)
                                    } else if (_top(op2['type']) == '*' || op2['type']['dtype'] !== undefined) {
                                        temp_res['value'] = op2['value']
                                    } else {
                                        CrashNotif("Unsupported type")
                                        return
                                    }
                                } else if (op1['type'] === 'char') {
                                    if (op2['type'] == 'int' ||
                                        op2['type'] == 'float' ||
                                        op2['type'] == 'char'
                                    ) {
                                        temp_res['value'] = TypeCastChar(op2)
                                    } else if (_top(op2['type']) == '*' || op2['type']['dtype'] !== undefined) {
                                        temp_res['value'] = op2['value'] % 256
                                    } else {
                                        CrashNotif("Unsupported type")
                                        return
                                    }
                                } else if (_top(op1['type']) == '*') {
                                    if (op2['type'] == 'float') {
                                        CrashNotif("Requied integral type for pointer arithmetic")
                                        return
                                    }
                                    if (op2['type'] == 'int' || _top(op2['type']) == '*' || op2['type']['dtype'] !== undefined) {
                                        temp_res['value'] = op2['value']
                                    }
                                    if (op2['type'] == 'char') {
                                        temp_res['value'] = TypeCastInt(op2)
                                    }
                                }
                                else if (op1['type']['dtype'] !== undefined) {
                                    CrashNotif("Cannot assign to constant pointers")
                                    return
                                } else if (op1['type'] === op2['type']) {
                                    // temp_res['value'] = op2['value']
                                    // add struct copy feature here later
                                    // if(op1['type'] === 'struct stack'){
                                    //     postfix_stack.push(op1)
                                    //     postfix_stack.push("top")
                                    //     postfix_push(".")
                                    // }
                                    // else if(op1['type'] === 'struct queue'){

                                    // }
                                    // else if(op1['type'] === 'struct sll'){

                                    // }
                                    // else if(op1['type'] === 'struct dll'){

                                    // }
                                    // else if(op1['type'] === 'struct tree'){

                                    // }
                                    if (op1['type'] === 'struct stack' ||
                                        op1['type'] === 'struct queue' ||
                                        op1['type'] === 'struct sll' ||
                                        op1['type'] === 'struct dll' ||
                                        op1['type'] === 'struct tree') {
                                        let t = inbuilt_structs[op1['type'].split(" ")[1]]
                                        for (let j in t) {
                                            postfix_stack.push(op1)
                                            postfix_stack.push(j)
                                            postfix_push('.')
                                            postfix_stack.push(op2)
                                            postfix_stack.push(j)
                                            postfix_push('.')
                                            postfix_push('=')
                                            postfix_stack.pop()
                                        }
                                    }
                                    postfix_stack.push(op1)
                                    break;
                                } else {
                                    CrashNotif("Invalid type ")
                                    return
                                }
                                setVariableData(op1, temp_res['value'])
                                postfix_stack.push(op1)
                                break
                            case '+=':
                                postfix_stack.push(op1);
                                postfix_stack.push(op1);
                                postfix_stack.push(op2);
                                postfix_push('+')
                                postfix_push('=');
                                break;
                            case '-=':
                                postfix_stack.push(op1);
                                postfix_stack.push(op1);
                                postfix_stack.push(op2);
                                postfix_push('-')
                                postfix_push('=');
                                break;
                            case '*=':
                                postfix_stack.push(op1);
                                postfix_stack.push(op1);
                                postfix_stack.push(op2);
                                postfix_push('*')
                                postfix_push('=');
                                break;
                            case '/=':
                                postfix_stack.push(op1);
                                postfix_stack.push(op1);
                                postfix_stack.push(op2);
                                postfix_push('/')
                                postfix_push('=');
                                break;
                            case '%=':
                                postfix_stack.push(op1);
                                postfix_stack.push(op1);
                                postfix_stack.push(op2);
                                postfix_push('%')
                                postfix_push('=');
                                break;
                            case '||':
                                temp_res['type'] = 'int'
                                temp_res['value'] = 1
                                if (op1['addr'] !== undefined) {
                                    op1 = { 'value': getVariableData(op1), 'type': op1['type'] }
                                }
                                if (op2['addr'] !== undefined) {
                                    op2 = { 'value': getVariableData(op2), 'type': op2['type'] }
                                }
                                if (op1['type'] == 'char') {
                                    op1['value'] = TypeCastInt(op1)
                                }
                                if (op2['type'] == 'char') {
                                    op2['value'] = TypeCastInt(op2)
                                }
                                if (op1['value'] == 0 && op2['value'] == 0) {
                                    temp_res['value'] = 0
                                }
                                postfix_stack.push(temp_res)
                                break;
                            case '&&':
                                temp_res['type'] = 'int'
                                temp_res['value'] = 0
                                if (op1['addr'] !== undefined) {
                                    op1 = { 'value': getVariableData(op1), 'type': op1['type'] }
                                }
                                if (op2['addr'] !== undefined) {
                                    op2 = { 'value': getVariableData(op2), 'type': op2['type'] }
                                }
                                if (op1['type'] == 'char') {
                                    op1['value'] = TypeCastInt(op1)
                                }
                                if (op2['type'] == 'char') {
                                    op2['value'] = TypeCastInt(op2)
                                }
                                if (op1['value'] != 0 && op2['value'] != 0) {
                                    temp_res['value'] = 1
                                }
                                postfix_stack.push(temp_res)
                                break;
                            case '==':
                                temp_res['type'] = 'int'
                                temp_res['value'] = 0
                                if (op1['addr'] !== undefined) {
                                    op1 = { 'value': getVariableData(op1), 'type': op1['type'] }
                                }
                                if (op2['addr'] !== undefined) {
                                    op2 = { 'value': getVariableData(op2), 'type': op2['type'] }
                                }
                                if (op1['type'] == 'char') {
                                    op1['value'] = TypeCastInt(op1)
                                }
                                if (op2['type'] == 'char') {
                                    op2['value'] = TypeCastInt(op2)
                                }
                                if (op1['value'] == op2['value']) {
                                    temp_res['value'] = 1
                                }
                                postfix_stack.push(temp_res)
                                break;
                            case '!=':
                                temp_res['type'] = 'int'
                                temp_res['value'] = 0
                                if (op1['addr'] !== undefined) {
                                    op1 = { 'value': getVariableData(op1), 'type': op1['type'] }
                                }
                                if (op2['addr'] !== undefined) {
                                    op2 = { 'value': getVariableData(op2), 'type': op2['type'] }
                                }
                                if (op1['type'] == 'char') {
                                    op1['value'] = TypeCastInt(op1)
                                }
                                if (op2['type'] == 'char') {
                                    op2['value'] = TypeCastInt(op2)
                                }
                                if (op1['value'] != op2['value']) {
                                    temp_res['value'] = 1
                                }
                                postfix_stack.push(temp_res)
                                break;
                            case '>':
                                temp_res['type'] = 'int'
                                temp_res['value'] = 0
                                if (op1['addr'] !== undefined) {
                                    op1 = { 'value': getVariableData(op1), 'type': op1['type'] }
                                }
                                if (op2['addr'] !== undefined) {
                                    op2 = { 'value': getVariableData(op2), 'type': op2['type'] }
                                }
                                if (op1['type'] == 'char') {
                                    op1['value'] = TypeCastInt(op1)
                                }
                                if (op2['type'] == 'char') {
                                    op2['value'] = TypeCastInt(op2)
                                }
                                if (op1['value'] > op2['value']) {
                                    temp_res['value'] = 1
                                }
                                postfix_stack.push(temp_res)
                                break;
                            case '<':
                                temp_res['type'] = 'int'
                                temp_res['value'] = 0
                                if (op1['addr'] !== undefined) {
                                    op1 = { 'value': getVariableData(op1), 'type': op1['type'] }
                                }
                                if (op2['addr'] !== undefined) {
                                    op2 = { 'value': getVariableData(op2), 'type': op2['type'] }
                                }
                                if (op1['type'] == 'char') {
                                    op1['value'] = TypeCastInt(op1)
                                }
                                if (op2['type'] == 'char') {
                                    op2['value'] = TypeCastInt(op2)
                                }
                                if (op1['value'] < op2['value']) {
                                    temp_res['value'] = 1
                                }
                                postfix_stack.push(temp_res)
                                break;
                            case '>=':
                                temp_res['type'] = 'int'
                                temp_res['value'] = 0
                                if (op1['addr'] !== undefined) {
                                    op1 = { 'value': getVariableData(op1), 'type': op1['type'] }
                                }
                                if (op2['addr'] !== undefined) {
                                    op2 = { 'value': getVariableData(op2), 'type': op2['type'] }
                                }
                                if (op1['type'] == 'char') {
                                    op1['value'] = TypeCastInt(op1)
                                }
                                if (op2['type'] == 'char') {
                                    op2['value'] = TypeCastInt(op2)
                                }
                                if (op1['value'] >= op2['value']) {
                                    temp_res['value'] = 1
                                }
                                postfix_stack.push(temp_res)
                                break;
                            case '<=':
                                temp_res['type'] = 'int'
                                temp_res['value'] = 0
                                if (op1['addr'] !== undefined) {
                                    op1 = { 'value': getVariableData(op1), 'type': op1['type'] }
                                }
                                if (op2['addr'] !== undefined) {
                                    op2 = { 'value': getVariableData(op2), 'type': op2['type'] }
                                }
                                if (op1['type'] == 'char') {
                                    op1['value'] = TypeCastInt(op1)
                                }
                                if (op2['type'] == 'char') {
                                    op2['value'] = TypeCastInt(op2)
                                }
                                if (op1['value'] <= op2['value']) {
                                    temp_res['value'] = 1
                                }
                                postfix_stack.push(temp_res)
                                break;
                            case '+':
                                temp_res['type'] = resolveTypes(op1['type'], op2['type'])
                                if (op1['addr'] !== undefined) {
                                    op1 = { 'value': getVariableData(op1), 'type': op1['type'] }
                                }
                                if (op2['addr'] !== undefined) {
                                    op2 = { 'value': getVariableData(op2), 'type': op2['type'] }
                                }
                                if (op1['type'] == 'char') {
                                    op1['value'] = TypeCastInt(op1)
                                }
                                if (op2['type'] == 'char') {
                                    op2['value'] = TypeCastInt(op2)
                                }
                                if (is_pointer(op1) && is_pointer(op2) == '*') {
                                    CrashNotif("cant add pointers")
                                }
                                else if (is_pointer(op1) && !is_pointer(op2)) {
                                    if (op1['type']['dtype'] !== undefined) {
                                        let elem_size = size_of(op1['type'])
                                        let result = op1['value'] + elem_size * op2['value']
                                        // postfix_stack.push(result)
                                        temp_res['value'] = result
                                    }
                                    else {
                                        temp_res['value'] = op1['value'] + op2['value'] * size_of(op1['type'].slice(0, -1))
                                    }
                                }
                                else if (!is_pointer(op1) && is_pointer(op2)) {
                                    if (op2['type']['dtype'] !== undefined) {
                                        let elem_size = size_of(op2['type'])
                                        let result = op2['value'] + elem_size * op1['value']
                                        // postfix_stack.push(result)
                                        temp_res['value'] = result
                                    }
                                    else {
                                        temp_res['value'] = op1['value'] * size_of(op2['type'].slice(0, -1)) + op2['value']
                                    }
                                }
                                else {
                                    temp_res['value'] = op1['value'] + op2['value']
                                }
                                if (temp_res['type'] == 'char') {
                                    temp_res['value'] = TypeCastChar({ 'value': temp_res['value'], 'type': 'float' })
                                }
                                postfix_stack.push(temp_res)
                                break;
                            case '-':
                                temp_res['type'] = resolveTypes(op1['type'], op2['type'])
                                if (op1['addr'] !== undefined) {
                                    op1 = { 'value': getVariableData(op1), 'type': op1['type'] }
                                }
                                if (op2['addr'] !== undefined) {
                                    op2 = { 'value': getVariableData(op2), 'type': op2['type'] }
                                }
                                if (op1['type'] == 'char') {
                                    op1['value'] = TypeCastInt(op1)
                                }
                                if (op2['type'] == 'char') {
                                    op2['value'] = TypeCastInt(op2)
                                }
                                if (is_pointer(op1) && is_pointer(op2)) {
                                    if (op1['type']['dtype'] === undefined && op2['type']['dtype'] === undefined) {
                                        if (op1['type'] == op2['type']) {
                                            temp_res['value'] = op1['value'] - op2['value']
                                        }
                                    }
                                    else if (op1['type']['dtype'] === undefined || op2['type']['dtype'] === undefined) {
                                        CrashNotif("Subtraction between pointers and arrays is invalid")
                                        return
                                    }
                                    else {
                                        //same array or not?
                                        if (op1['type']['dtype'] != op2['type']['dtype']) {
                                            CrashNotif("Subtraction between different types of arrays is invalid")
                                            return
                                        }
                                        if (op1['type']['dims'].length != op2['type']['dims'].length) {
                                            CrashNotif("Subtraction between different types of arrays is invalid")
                                            return
                                        }
                                        for (let i = 0; i < op1['type']['dims'].length; i++) {
                                            if (op1['type']['dims'][i]['value'] != op2['type']['dims'][i]['value']) {
                                                CrashNotif("Subtraction between different types of arrays is invalid")
                                                return
                                            }
                                        }
                                        temp_res['value'] = op1['value'] - op2['value']
                                    }
                                }
                                else if (is_pointer(op1) && !is_pointer(op2)) {
                                    if (op1['type']['dtype'] !== undefined) {
                                        let elem_size = size_of(op1['type'])
                                        let result = op1['value'] - elem_size * op2['value']
                                        // postfix_stack.push(result)
                                        temp_res['value'] = result
                                    }
                                    else {
                                        temp_res['value'] = op1['value'] - op2['value'] * size_of(op1['type'].slice(0, -1))
                                    }
                                }
                                else if (!is_pointer(op1) && is_pointer(op2)) {
                                    if (op2['type']['dtype'] !== undefined) {
                                        let elem_size = size_of(op2['type'])
                                        let result = -op2['value'] + elem_size * op1['value']
                                        // postfix_stack.push(result)
                                        temp_res['value'] = result
                                    }
                                    else {
                                        temp_res['value'] = op1['value'] * size_of(op2['type'].slice(0, -1)) - op2['value']
                                    }
                                }
                                else {
                                    temp_res['value'] = op1['value'] - op2['value']
                                }
                                if (temp_res['type'] == 'char') {
                                    temp_res['value'] = TypeCastChar({ 'value': temp_res['value'], 'type': 'float' })
                                }
                                postfix_stack.push(temp_res)
                                break;
                            case '*':
                                temp_res['type'] = resolveTypes(op1['type'], op2['type'])
                                if (op1['addr'] !== undefined) {
                                    op1 = { 'value': getVariableData(op1), 'type': op1['type'] }
                                }
                                if (op2['addr'] !== undefined) {
                                    op2 = { 'value': getVariableData(op2), 'type': op2['type'] }
                                }
                                if (op1['type'] == 'char') {
                                    op1['value'] = TypeCastInt(op1)
                                }
                                if (op2['type'] == 'char') {
                                    op2['value'] = TypeCastInt(op2)
                                }
                                if (_top(op1['type']) == '*' || _top(op2['type']) == '*') {
                                    CrashNotif("Arithmetic types required")
                                    return
                                }
                                else {
                                    temp_res['value'] = op1['value'] * op2['value']
                                }
                                if (temp_res['type'] == 'char') {
                                    temp_res['value'] = TypeCastChar({ 'value': temp_res['value'], 'type': 'float' })
                                }
                                else if (temp_res['type'] == 'int') {
                                    temp_res['value'] = TypeCastInt({ 'value': temp_res['value'], 'type': 'float' })
                                }
                                postfix_stack.push(temp_res)
                                break;
                            case '%':
                                temp_res['type'] = resolveTypes(op1['type'], op2['type'])
                                if (op1['addr'] !== undefined) {
                                    op1 = { 'value': getVariableData(op1), 'type': op1['type'] }
                                }
                                if (op2['addr'] !== undefined) {
                                    op2 = { 'value': getVariableData(op2), 'type': op2['type'] }
                                }
                                if (op1['type'] == 'char') {
                                    op1['value'] = TypeCastInt(op1)
                                }
                                if (op2['type'] == 'char') {
                                    op2['value'] = TypeCastInt(op2)
                                }
                                if (_top(op1['type']) == '*' || _top(op2['type']) == '*') {
                                    CrashNotif("Arithmetic types required")
                                    return
                                }
                                if (temp_res['type'] == 'float') {
                                    CrashNotif("Cannot apply modulo on floating values")
                                    return
                                }
                                else {
                                    temp_res['value'] = op1['value'] % op2['value']
                                }
                                if (temp_res['type'] == 'char') {
                                    temp_res['value'] = TypeCastChar({ 'value': temp_res['value'], 'type': 'float' })
                                }
                                postfix_stack.push(temp_res)
                                break;
                            case '/':
                                temp_res['type'] = resolveTypes(op1['type'], op2['type'])
                                if (op1['addr'] !== undefined) {
                                    op1 = { 'value': getVariableData(op1), 'type': op1['type'] }
                                }
                                if (op2['addr'] !== undefined) {
                                    op2 = { 'value': getVariableData(op2), 'type': op2['type'] }
                                }
                                if (op1['type'] == 'char') {
                                    op1['value'] = TypeCastInt(op1)
                                }
                                if (op2['type'] == 'char') {
                                    op2['value'] = TypeCastInt(op2)
                                }
                                if (_top(op1['type']) == '*' || _top(op2['type']) == '*') {
                                    CrashNotif("Arithmetic types required")
                                    return
                                }
                                else {
                                    if (op2['value'] === 0) {
                                        CrashNotif('Divide by Zero')
                                        return
                                    }
                                    temp_res['value'] = op1['value'] / op2['value']
                                }
                                if (temp_res['type'] == 'char') {
                                    temp_res['value'] = TypeCastChar({ 'value': temp_res['value'], 'type': 'float' })
                                }
                                else if (temp_res['type'] == 'int') {
                                    temp_res['value'] = TypeCastInt({ 'value': temp_res['value'], 'type': 'float' })
                                }
                                postfix_stack.push(temp_res)
                                break;
                            case '.':
                                if (op1['addr'] === undefined) {
                                    CrashNotif("Cant access temporary variable")
                                    return
                                }
                                temp_res['value'] = op1['addr']
                                temp_res['type'] = op1['type'] + '*'
                                postfix_stack.push(temp_res)
                                postfix_stack.push(op2)
                                postfix_push('->')
                                break;
                            case '->':
                                if (op1['addr'] !== undefined) {
                                    op1 = { 'value': getMemoryData(op1['addr']), 'type': op1['type'], 'addr': op1['addr'] }
                                }
                                if (op1['type'] == "struct stack*") {
                                    if (op2 == 'arr') {
                                        temp_res['addr'] = op1['value']
                                        temp_res['value'] = getMemoryData(temp_res['addr'])
                                        temp_res['type'] = "int*"
                                        postfix_stack.push(temp_res)
                                    } else if (op2 == 'size') {
                                        temp_res['addr'] = op1['value'] + 8
                                        temp_res['value'] = getMemoryData(temp_res['addr'])
                                        temp_res['type'] = "int"
                                        postfix_stack.push(temp_res)
                                    } else if (op2 == 'top') {
                                        temp_res['addr'] = op1['value'] + 12
                                        temp_res['value'] = getMemoryData(temp_res['addr'])
                                        temp_res['type'] = "int"
                                        postfix_stack.push(temp_res)

                                    } else {
                                        CrashNotif("No such member")
                                    }
                                } else if (op1['type'] == "struct queue*") {
                                    if (op2 == 'arr') {
                                        temp_res['addr'] = op1['value']
                                        temp_res['value'] = getMemoryData(temp_res['addr'])
                                        temp_res['type'] = "int*"
                                        postfix_stack.push(temp_res)
                                    } else if (op2 == 'size') {
                                        temp_res['addr'] = op1['value'] + 8
                                        temp_res['value'] = getMemoryData(temp_res['addr'])
                                        temp_res['type'] = "int"
                                        postfix_stack.push(temp_res)
                                    } else if (op2 == 'rear') {
                                        temp_res['addr'] = op1['value'] + 12
                                        temp_res['value'] = getMemoryData(temp_res['addr'])
                                        temp_res['type'] = "int"
                                        postfix_stack.push(temp_res)
                                    } else if (op2 == 'front') {
                                        temp_res['addr'] = op1['value'] + 16
                                        temp_res['value'] = getMemoryData(temp_res['addr'])
                                        temp_res['type'] = "int"
                                        postfix_stack.push(temp_res)
                                    } else {
                                        CrashNotif("No such member")
                                    }
                                } else if (op1['type'] == "struct sll*") {
                                    if (op2 == 'next') {
                                        temp_res['addr'] = op1['value']
                                        temp_res['value'] = getMemoryData(temp_res['addr'])
                                        temp_res['type'] = "struct sll*"
                                        postfix_stack.push(temp_res)
                                    } else if (op2 == 'info') {
                                        temp_res['addr'] = op1['value'] + 8
                                        temp_res['value'] = getMemoryData(temp_res['addr'])
                                        temp_res['type'] = "int"
                                        postfix_stack.push(temp_res)
                                    } else {
                                        CrashNotif("No such member")
                                    }
                                } else if (op1['type'] == "struct dll*") {
                                    if (op2 == 'next') {
                                        temp_res['addr'] = op1['value']
                                        temp_res['value'] = getMemoryData(temp_res['addr'])
                                        temp_res['type'] = "struct dll*"
                                        postfix_stack.push(temp_res)
                                    } else if (op2 == 'prev') {
                                        temp_res['addr'] = op1['value'] + 8
                                        temp_res['value'] = getMemoryData(temp_res['addr'])
                                        temp_res['type'] = "struct dll*"
                                        postfix_stack.push(temp_res)
                                    } else if (op2 == 'info') {
                                        temp_res['addr'] = op1['value'] + 16
                                        temp_res['value'] = getMemoryData(temp_res['addr'])
                                        temp_res['type'] = "int"
                                        postfix_stack.push(temp_res)
                                    } else {
                                        CrashNotif("No such member")
                                    }
                                } else if (op1['type'] == "struct tree*") {
                                    if (op2 == 'left') {
                                        temp_res['addr'] = op1['value']
                                        temp_res['value'] = getMemoryData(temp_res['addr'])
                                        temp_res['type'] = "struct tree*"
                                        postfix_stack.push(temp_res)
                                    } else if (op2 == 'right') {
                                        temp_res['addr'] = op1['value'] + 8
                                        temp_res['value'] = getMemoryData(temp_res['addr'])
                                        temp_res['type'] = "struct tree*"
                                        postfix_stack.push(temp_res)
                                    } else if (op2 == 'info') {
                                        temp_res['addr'] = op1['value'] + 16
                                        temp_res['value'] = getMemoryData(temp_res['addr'])
                                        temp_res['type'] = "int"
                                        postfix_stack.push(temp_res)
                                    } else {
                                        CrashNotif("No such member")
                                    }
                                } else {
                                    CrashNotif("No such Structure")
                                    return
                                }
                                break;
                            case ',':
                                if (op1[0] === undefined) {
                                    postfix_stack.push([op1, op2])
                                } else {
                                    op1.push(op2)
                                    postfix_stack.push(op1)
                                }
                                break;
                        }
                }
            }
            let exp_end = function () {
                debugger
                while (operation_stack.length > 1) {
                    postfix_push(operation_stack.pop())
                }
            }
            for (let i = 0; i < tokens.length; i++) {
                let c = tokens[i]
                if (parse_mode == 0) {
                    if (is_identifier(c) && tokens[i - 1] != '.' && tokens[i - 1] != '->') {
                        if (tokens[i + 1] == '(') {
                            // is a function(handle later)
                            temp = { 'name': c, 'type': 'func' }
                            switch (c) { }
                            if (c == 'printf' || c == 'scanf' || c == 'malloc' || c == 'calloc' || c == 'realloc' || c == 'free' || c == 'exit') {
                                console.log("inbuilt function call detected:", c)
                            }
                            else {
                                // check for udf
                            }
                            operation_stack.push(temp);
                            if (tokens[i + 2] == ')') {
                                console.log("zero parameter function")
                                postfix_stack.push([]);
                            }
                        }
                        else {
                            temp = getVariableIndex(c, scope)
                            temp = Variables[temp]
                            await conv(temp)
                        }
                    }
                    else if (c == 'sizeof') {
                        // sizeof with datatype instead of args
                        await conv(c);
                        if (typeof (tokens[i + 1]) == 'string' && tokens[i + 1][0] == '(' && _top(tokens[i + 1]) == ')') {
                            i++;
                            postfix_stack.push(tokens[i]);
                        }
                        else if (tokens[i + 1] == '(' && tokens[i + 2] == 'struct' && tokens[i + 4] == ')') {
                            postfix_stack.push('(struct ' + tokens[i + 3] + ')');
                            i += 4;
                        }
                    }
                    else if (c == ';') {
                        break
                    }
                    else {
                        await conv(c)
                    }
                }
                else if (parse_mode == 1) {
                } else if (parse_mode == 2) {

                }
            }
            // console.log(postfix_stack)
            exp_end()
            result = postfix_stack[0]
            return result
        }

        function getContainer(StartLine, StartIndex) {
            let brackets_stack = []
            let in_string = false
            let line = Program[StartLine]
            for (let j = StartIndex; j < line.length; j++) {
                if (line[j] === '{') {
                    if (!in_string) {
                        brackets_stack.push([StartLine, j])
                    }
                }
                else if (line[j] === '}') {
                    if (!in_string) {
                        if (brackets_stack.length == 1) {
                            return { 'start': brackets_stack[0], 'end': [StartLine, j] }
                        }
                        brackets_stack.pop()
                    }
                }
                else if (/^\S$/.test(line[j])) {
                    if (brackets_stack.length == 0) {
                        return undefined
                    }
                    else if (in_string === true && line[j] == "\\") {
                        j++
                    }
                    else if (line[j] == '"') {
                        in_string = !in_string
                    }
                }
            }
            for (let i = StartLine + 1; i < Program.length; i++) {
                let line = Program[i]
                for (let j = 0; j < line.length; j++) {
                    if (line[j] === '{') {
                        if (!in_string) {
                            brackets_stack.push([i, j])
                        }
                    }
                    else if (line[j] === '}') {
                        if (!in_string) {
                            if (brackets_stack.length == 1) {
                                return { 'start': brackets_stack[0], 'end': [i, j] }
                            }
                            brackets_stack.pop()
                        }
                    }
                    else if (in_string === true && line[j] == "\\") {
                        j++
                    }
                    else if (line[j] == '"') {
                        in_string = !in_string
                    }
                }
            }

            // not yet implemented

        }
        function getVariableIndex(VariableName, scope) {
            let function_scope = 0
            for (let j = 0; j < Branch_stack.length; j++) {
                if (Branch_stack[j]['keyword'] == "function") {
                    function_scope = Branch_stack[j]['scope']
                }
            }
            VariableName = VariableName.trim()
            for (let j = Variables.length - 1; j >= 0; j--) {
                if (Variables[j]['name'] == VariableName)//scope 0=malloced values
                {
                    if ((Variables[j]['scope'] <= scope && Variables[j]['scope'] >= function_scope) || Variables[j]['scope'] == 0) {
                        return j
                    }
                }
            }
            return undefined
        }
        function deallocateOutOfScopeVariables(current_scope) {
            for (let i = Variables.length - 1; i >= 0; i--) {
                if (Variables[i]['scope'] > current_scope) {
                    // removeVariable(Variables[i])
                    Variables.pop(i)
                }
            }
            for (let i in Memory) {
                if (Memory[i]['scope'] > current_scope) {
                    free_mem(i, true)
                }
            }
        }
        function CrashNotif(extra_detail) {
            if (typeof (extra_detail) == 'string') {
                extra_detail = { 'error word': extra_detail }
            }
            console.log("crashed")
            console.log(extra_detail['error word'])
            Program = []
            // showErrorPopup(extra_detail["error word"]);
            throw new Error(extra_detail['error word'])
        }
        function TypeCastInt(value) {
            if (value['type'] == "float") {
                if (value['value'] >= 0)
                    return Math.floor(value['value'])
                else
                    return Math.ceil(value['value'])
            }
            else if (value['type'] == "int") {
                return value['value']
            }
            else if (value['type'] == "char") {
                if (value['value'].charCodeAt === undefined) return value['value']
                return value['value'].charCodeAt();
            }
            else if (typeof (value['type']) == "string" && _top(value['type']) == "*") {
                return value['value']
            }
            else if (typeof (value['type']) == "object") {
                return value['addr']
            }
            else {
                CrashNotif({ "error word": "int mismatch" })
                return undefined
            }
        }
        function TypeCastFloat(value) {
            if (value['type'] == "float") {
                return value['value']
            }
            else if (value['type'] == "int") {
                return value['value']
            }
            else if (value['type'] == "char") {
                return value['value'].charCodeAt();
            }
            else {
                CrashNotif({ "error word": "float mismatch" })
                return undefined
            }
        }
        function TypeCastChar(value) {
            if (value['type'] == "float") {
                // return String.fromCharCode(TypeCastInt(value['value']) % 256)
                // return String.fromCharCode(TypeCastInt(value) % 256)
                return TypeCastInt(value) % 256
            }
            else if (value['type'] == "int") {
                // return String.fromCharCode((value['value']) % 256)
                return (value['value']) % 256
            }
            else if (value['type'] == "char") {
                return value['value'];
            }
            else if (typeof (value['type']) == "string" && _top(value['type']) == "*") {
                return value['value'] % 256
            }
            else if (typeof (value['type']) == "object") {
                return value['addr'] % 256
            }
            else {
                CrashNotif({ "error word": "char mismatch" })
                return undefined
            }
        }
        function TypeCastPointer(value) {
            if (value['type'] == "int") {
                return Math.max(0, value['value'])
            }
            else if (value['type'] == "char") {
                if (value['value'].charCodeAt === undefined) return value['value']
                return value['value'].charCodeAt();
            }
            else if (typeof (value['type']) == "string" && _top(value['type']) == "*") {
                return Math.max(0, value['value'])
            }
            else if (typeof (value['type']) == "object") {
                return Math.max(0, value['addr'])
            }
            else {
                CrashNotif({ "error word": "Cannot convert to Pointer" })
                return undefined
            }
        }
        function regexQuote(s) { return s.replace(/[\[\]^$*+?{}.|\\]/g, "\\$&") }
        function compile(_pgrm) {
            // let nodes = document.getElementsByClassName("Node")
            // for (let i = nodes.length - 1; i >= 0; i--) {
            //     nodes[i].parentElement.removeChild(nodes[i])
            // }
            // syntaxCorrection();
            let val = _pgrm
            deallocateOutOfScopeVariables(-1)
            try {
                PAUSE_EXEC = true
                // Pauseexecution()
            }
            catch (e) { }
            Variables = []
            Branch_stack = [{ "keyword": "function", 'name': 'main', "scope": 1 }]
            functions = {}
            structs = {}
            typedefs = {}
            Current_Line = -1;
            ClearConsole();

            val = val.replaceAll("\r", "")
            // console.log(val)
            // main_function_outline=/^int main\(\){\n.*\treturn 0;\n}$/
            // main_function_outline=/^int main\(\){(.|\n)*\treturn 0;\n}$/
            // main_function_outline=/(int|(.|\n)*\nint) main\(\){(.|\n)*\treturn 0;\n}$/
            const main_function_outline = /^(.*\n)*\s*int[^\S\r\n]+main[^\S\r\n]*\([^\S\r\n]*\)[^\S\r\n]*{(.|\n)*\n\s*return[^\S\r\n]+0[^\S\r\n]*;\n\s*}\s*$/
            if (main_function_outline.test(val)) {
                if (check_syntax(val)) {
                    //checking for structs, global variables and functions
                    Cin_text = val
                    Program = val.split("\n")
                    let fixed_code_lines = 0// update this when you add in the struct codes
                    let variable_scope = 0
                    const dont_run_function = false
                    function get_param_detail(stream) {
                        let dt_size = 0, temp = { 'type': "" }
                        if (['int', 'char', 'float', 'void'].indexOf(stream[0]) != -1) {
                            dt_size = 1;
                            temp['type'] = stream[0];
                        }
                        else if (stream[0] == 'struct') {
                            dt_size = 2;
                            if (['stack', 'queue', 'sll', 'dll', 'tree'].indexOf(stream[1]) != -1) {
                                temp['type'] = 'struct ' + stream[1];
                            }
                            else {
                                CrashNotif("No such structure exists");
                            }
                        }
                        if (stream[dt_size] == '*') {
                            dt_size++;
                            temp['type'] += '*'
                        }
                        function is_identifier(x) {
                            if (x === undefined || x === "sizeof" || DataTypes.indexOf(x) != -1) return false
                            return /^[_a-zA-Z][_a-zA-Z0-9]*$/.test(x)
                        }
                        temp['name'] = stream[dt_size];
                        if (!is_identifier(temp['name'])) {
                            CrashNotif("invalid identifier");
                        }
                        dt_size++;
                        if (stream[dt_size] == '[') {
                            temp['type'] = { 'dtype': temp['type'], 'dims': [] }
                            if (stream[dt_size + 1] == ']') {
                                temp['type']['dims'].push(lineLexer(10000)[0])
                                dt_size += 2;
                            }
                            while (stream[dt_size] == '[') {
                                if (stream[dt_size + 2] == ']') {
                                    temp['type']['dims'].push(stream[dt_size + 1])
                                    dt_size += 3;
                                }
                                else {
                                    CrashNotif("secondary size must be a single number")
                                }
                            }
                        }
                        if (temp['type'] == "") {
                            CrashNotif("Type Error")
                        }
                        return [temp, dt_size];
                    }
                    // get_param_detail(['int','a'])
                    for (let i = fixed_code_lines; !dont_run_function && i < Program.length; i++) {
                        let line = lineLexer(Program[i])
                        if (variable_scope == 0) {
                            if (line[0] == 'struct' && line[2] == '{') {
                                console.log("is a struct")
                            }
                            else if (line.top == '{') {//a function
                                let func = null, ind = 0;
                                try {
                                    func = get_param_detail(line)
                                    ind += func[1];
                                    func = func[0];
                                } catch {
                                    console.log("is a struct??")
                                }
                                if (line[ind] != '(') {
                                    CrashNotif("incorrect opening function parenthesis");
                                }
                                let parameters = [], temp;
                                for (let j = ind + 1; j < line.length - 2; j++) {
                                    if (line[j] == ',') {
                                        continue;
                                    }
                                    temp = get_param_detail(line.slice(j))
                                    parameters.push(temp[0])
                                    j += temp[1]
                                }
                                // console.log(func, parameters)
                                functions[func['name']] = { 'line': i, "return_type": func['type'], "parameters": parameters }
                            }
                        }//in a container scope
                        if (line.indexOf('{') != -1) {
                            variable_scope++;
                        }
                        if (line.indexOf('}') != -1) {
                            variable_scope--;
                        }
                    }
                    datatypeExp = "((" + DataTypes[0] + ")"
                    for (let i = 1; i < DataTypes.length; i++) {
                        datatypeExp += "|(" + DataTypes[i] + ")"
                    }
                    datatypeExp += ")"
                    const variableExp = "[a-zA-Z_][a-zA-Z0-9_]*"
                    const regex_of_function = new RegExp("^\\s*" + datatypeExp + " +" + variableExp + "\\(( *(" + datatypeExp + " +" + variableExp + " *, *)*( *" + datatypeExp + " +" + variableExp + ") *)?" + "\\)\\{ *$")

                    let function_start_pointer = 0
                    for (let i = fixed_code_lines; i < Program.length; i++) {
                        let line = Program[i].trim()
                        if (line === "int main(){") {
                            function_start_pointer = i + 1
                            break
                        }
                    }
                    extra_render_data['ExecID'] = Math.random();
                    (async () => { await interpret(function_start_pointer, 1); Current_Line = -1 })()
                }
            }
            // let output=document.getElementById("Cout")
            // output.innerHTML=val
        }
        function check_syntax(text) { // balanced bracket checks only
            let brackets_stack = []
            for (let i = 0; i < text.length; i++) {
                if (text[i] == "{" || text[i] == "(" || text[i] == '[') {
                    brackets_stack.push(text[i])
                }
                else if (text[i] == "\"") {
                    brackets_stack.push("\"")
                    i++;
                    while (i < text.length) {
                        if (text[i] == '\"') {
                            brackets_stack.pop()
                            break
                        }
                        else if (text[i] == '\\') {
                            i++
                        }
                        i++
                    }
                    if (brackets_stack[brackets_stack.length - 1] == "\"") {
                        return false
                    }
                }
                else if (text[i] == '\'') {
                    if (text[i + 2]) {
                        if (text[i + 2] == "\'") {
                            i += 2
                        }
                        else if (text[i + 1] == '\\' && text[i + 3] == '\'') {
                            i += 3
                        }
                        else {
                            return false
                        }
                    }
                    else {
                        return false
                    }
                }
                else if (text[i] == ')') {
                    if (brackets_stack[brackets_stack.length - 1] == '(') {
                        brackets_stack.pop()
                    }
                    else {
                        return false
                    }
                }
                else if (text[i] == '}') {
                    if (brackets_stack[brackets_stack.length - 1] == '{') {
                        brackets_stack.pop()
                    }
                    else {
                        return false
                    }
                }
                else if (text[i] == ']') {
                    if (brackets_stack[brackets_stack.length - 1] == '[') {
                        brackets_stack.pop()
                    }
                    else {
                        return false
                    }
                }
            }

            return brackets_stack.length == 0
        }

        function _top(arr) {
            if (arr === undefined)
                return arr
            if (arr.length === undefined)
                return undefined
            if (arr.length === 0)
                return undefined
            return arr[arr.length - 1]
        }
        function lineLexer(text) {
            // This is a lexical analyser
            // it takes input of a string and returns an array of token
            let tokens = []
            let temp = ""
            text = text + " "
            function is_identifier(x) {
                if (x === undefined) return false
                return /^[_a-zA-Z][_a-zA-Z0-9]*$/.test(x)
            }
            function is_int(x) {
                if (x === undefined) return false
                if (x['type'] == 'int') return true
                return /^[0-9]+$/.test(x)
            }
            function is_float(x) {
                if (x === undefined) return false
                if (x['type'] == 'float') return true
                return /^[0-9]+\.[0-9]+$/.test(x)
            }
            for (let i = 0; i < text.length; i++) {
                if (/^\s*$/.test(temp)) {
                    temp = ""//' ' '\t', '\n' 
                }
                if (temp.length == 0) {
                    temp = text[i]
                }
                else if (temp == ';') {
                    tokens.push(temp)
                    temp = text[i]
                }
                else if (temp == "=") {
                    if (text[i] == '=') {
                        temp = "=="
                        tokens.push(temp)
                        temp = ""
                    }
                    else {
                        tokens.push(temp)
                        temp = text[i]
                    }
                }
                else if (temp == "!") {
                    if (text[i] == '=') {
                        temp = "!="
                        tokens.push(temp)
                        temp = ""
                    }
                    else {
                        tokens.push(temp)
                        temp = text[i]
                    }
                }
                else if (temp == "+") {
                    if (text[i] == '=') {
                        temp = "+="
                        tokens.push(temp)
                        temp = ""
                    }
                    else if (text[i] == '+') {
                        temp = "++"
                        if (is_identifier(_top(tokens)) || _top(tokens) == ')' || _top(tokens) == ']') {
                            temp = "++post"
                        }
                        else {
                            temp = "++pre"
                        }
                        tokens.push(temp)
                        temp = ""
                    }
                    else {
                        if (is_identifier(_top(tokens)) || _top(tokens) == ')' || _top(tokens) == ']' || is_int(_top(tokens)) || is_float(_top(tokens))) {//detect if unary or not
                        }
                        else {
                            temp = "+unary"
                        }
                        tokens.push(temp)
                        temp = text[i]
                    }
                }
                else if (temp == "-") {
                    if (text[i] == '=') {
                        temp = "-="
                        tokens.push(temp)
                        temp = ""
                    }
                    else if (text[i] == '-') {
                        temp = "--"
                        if (is_identifier(_top(tokens)) || _top(tokens) == ')' || _top(tokens) == ']') {
                            temp = "--post"
                        }
                        else {
                            temp = "--pre"
                        }
                        tokens.push(temp)
                        temp = ""
                    }
                    else if (text[i] == '>') {
                        temp = "->"
                        tokens.push(temp)
                        temp = ""
                    }
                    else {
                        if (is_identifier(_top(tokens)) || _top(tokens) == ')' || _top(tokens) == ']' || is_int(_top(tokens)) || is_float(_top(tokens))) {//detect if unary or not
                        }
                        else {
                            temp = "-unary"
                        }
                        tokens.push(temp)
                        temp = text[i]
                    }
                }
                else if (temp == "%") {
                    if (text[i] == '=') {
                        temp = "%="
                        tokens.push(temp)
                        temp = ""
                    }
                    else {
                        tokens.push(temp)
                        temp = text[i]
                    }
                }
                else if (temp == "/") {
                    if (text[i] == '=') {
                        temp = "/="
                        tokens.push(temp)
                        temp = ""
                    }
                    else if (text[i] == '/') {
                        temp = "//"
                        break;
                        // tokens.push(temp)
                        // temp = ""
                    }
                    else {
                        tokens.push(temp)
                        temp = text[i]
                    }
                }
                else if (temp == "*") {
                    if (text[i] == '=') {
                        temp = "*="
                        tokens.push(temp)
                        temp = ""
                    }
                    else {
                        if (is_identifier(_top(tokens)) ||
                            _top(tokens) == ')' ||
                            _top(tokens) == ']' ||
                            is_int(_top(tokens)) ||
                            is_float(_top(tokens)) ||
                            _top(tokens) == '++post' ||
                            _top(tokens) == '--post'
                        ) {//detect if unary or not
                        }
                        else {
                            temp = "*deref"
                        }
                        tokens.push(temp)
                        temp = text[i]
                    }
                }
                else if (temp == "&") {
                    if (text[i] == '&') {
                        temp = "&&"
                        tokens.push(temp)
                        temp = ""
                    }
                    else {
                        tokens.push(temp)
                        temp = text[i]
                    }
                }
                else if (temp == "|") {
                    if (text[i] == '|') {
                        temp = "||"
                        tokens.push(temp)
                        temp = ""
                    }
                    else {
                        CrashNotif("Bitwise OR not supported")
                        return
                    }
                }
                else if (temp == '(' || temp == '[' || temp == ']' || temp == ')' || temp == '}' || temp == '{') {
                    tokens.push(temp)
                    temp = text[i]
                }
                else if (temp == ">") {
                    if (text[i] == '=') {
                        temp = ">="
                        tokens.push(temp)
                        temp = ""
                    }
                    else {
                        tokens.push(temp)
                        temp = text[i]
                    }
                }
                else if (temp == "<") {
                    if (text[i] == '=') {
                        temp = "<="
                        tokens.push(temp)
                        temp = ""
                    }
                    else {
                        tokens.push(temp)
                        temp = text[i]
                    }
                }
                else if (temp == ".") {
                    tokens.push(temp)
                    temp = text[i]
                }
                else if (temp == ",") {
                    tokens.push(temp)
                    temp = text[i]
                }
                else if (temp.indexOf("'") == 0) {
                    if (temp == '\'') {
                        temp += text[i]
                    }
                    else if (temp == '\'\\') {
                        temp += text[i]
                        // if (text[i] == '0' || text[i] == 'n' || text[i] == 't') {
                        //     temp += text[i];
                        // }
                        // else {
                        //     CrashNotif("Lex Error at line " + i)
                        // }
                    } else if (text[i] == '\'') {
                        if (temp.length < 2) {
                            CrashNotif("Lex Error- invalid character at line " + i)
                            return
                        }
                        else {
                            temp += text[i]
                            if (temp == '\'\\0\'') {
                                temp = '\0'
                            } else {
                                // console.log(temp)
                                temp = JSON.parse(`"${temp.slice(1, -1)}"`)
                            }
                            tokens.push({ 'value': temp.charCodeAt(), 'type': 'char' })
                            temp = ""
                        }
                    }
                }
                else if (temp.indexOf('\"') == 0) {
                    if (text[i] == '\"') {
                        temp += '\0'
                        tokens.push({ 'value': temp.slice(1), 'type': 'string' })
                        temp = ""
                    }
                    else if (text[i] == '\\') {
                        let esc = text[i] + text[i + 1]
                        if (esc == '\\0') {
                            temp += '\0'
                        } else if (esc == '\\t') {
                            temp += '\t'
                        } else if (esc == '\\n') {
                            temp += '\n'
                        } else if (esc == '\\a') {
                            temp += '\x07';
                        }
                        i++;
                    } else {
                        temp += text[i];
                    }
                }
                else if (is_int(temp)) {
                    if (/^[0-9\.]$/.test(text[i])) {
                        temp += text[i]
                    }
                    else {
                        temp = { 'value': Number(temp), 'type': 'int' }
                        tokens.push(temp)
                        temp = text[i]
                    }
                }
                else if (is_float(temp) || is_int(temp.slice(0, -1))) {
                    if (/^[0-9]$/.test(text[i])) {
                        temp += text[i]
                    }
                    else {
                        temp = { 'value': Number(temp), 'type': 'float' }
                        tokens.push(temp)
                        temp = text[i]
                    }
                }
                else if (is_identifier(temp)) {
                    if (is_identifier(temp + text[i])) {
                        temp += text[i]
                    }
                    else {
                        switch (temp) {
                            case 'STACK':
                            case 'QUEUE':
                            case 'SLL':
                            case 'DLL':
                            case 'TREE':
                                tokens.push('struct')
                                tokens.push(temp.toLowerCase())
                                tokens.push('*')
                                break;
                            case 'NULL':
                                tokens.push({ 'value': 0, 'type': 'int' })
                                break;
                            default:
                                tokens.push(temp)
                        }
                        temp = text[i]
                    }
                }
            }
            function typecast_token_generation(tokens) {
                for (let i = tokens.length; i > 0; i--) {
                    if (tokens[i] == ')') {
                        // if(tokens[i-2]=="(" && (tokens[i-1]=="int" || tokens[i-1]=="float" || tokens[i-1]=="char")){
                        //     tokens[i-2]='('+token[i-1]+')'
                        //     tokens.splice(i-1,2)
                        //     i-=2;
                        // }
                        let _3token = tokens[i - 2] + tokens[i - 1] + tokens[i]
                        let _4token = tokens[i - 3] + tokens[i - 2] + tokens[i - 1] + tokens[i]
                        let _5token = tokens[i - 4] + tokens[i - 3] + tokens[i - 2] + tokens[i - 1] + tokens[i]
                        if (_3token == '(int)' || _3token == '(char)' || _3token == '(float)') {
                            tokens[i - 2] = _3token
                            tokens.splice(i - 1, 2)
                            i -= 2;
                        }
                        else if (_4token == '(int*)' || _4token == '(char*)' || _4token == '(float*)') {
                            tokens[i - 3] = _4token
                            tokens.splice(i - 2, 3)
                            i -= 3;
                        }
                        else if (_5token == '(int**deref)' || _5token == '(char**deref)' || _5token == '(float**deref)') {
                            tokens[i - 4] = '(' + tokens[i - 3] + '**)'
                            tokens.splice(i - 3, 4)
                            i -= 4;
                        }
                        else if (_5token == '(structstack*)' || _5token == '(structqueue*)' || _5token == '(structsll*)' || _5token == '(structdll*)' || _5token == '(structtree*)') {
                            tokens[i - 4] = '(struct ' + tokens[i - 2] + '*)'
                            tokens.splice(i - 3, 4)
                            i -= 4;
                        }
                    }
                }
            }
            typecast_token_generation(tokens)
            return tokens
        }
        function getMemoryData(mem_loc) {
            if (mem_loc in Memory) {
                let data = Memory[mem_loc]['value']
                if (typeof (data) == 'object') {
                    while (typeof (data[0]) == 'object') {
                        data = data[0]
                    }
                    if (data[0] !== undefined) {
                        return data[0]
                    }
                    else {
                        return 0
                    }
                } else {
                    return data
                }
            }
            else {
                let unwrap = function (obj) {
                    let unwrapped_memory = {}
                    for (let i in obj) {
                        if (typeof (obj[i]) != "object") {
                            unwrapped_memory[i] = obj[i]
                        }
                        else {
                            let inner_wrap = unwrap(obj[i])
                            for (let j in inner_wrap) {
                                unwrapped_memory[Number(i) + Number(j)] = inner_wrap[j]
                            }
                        }
                    }
                    return unwrapped_memory
                }
                for (let mem in Memory) {
                    mem = Number(mem)
                    if (mem <= mem_loc && mem + Memory[mem]['size'] > mem_loc) {
                        let data = unwrap(Memory[mem]['value'])
                        if (data[mem_loc - mem] !== undefined) {
                            return data[mem_loc - mem]
                        }
                        else {
                            return 0
                        }
                    }
                }
            }
            CrashNotif("Accessing Unallocated Memory")
        }
        function setMemoryData(mem_loc, value) {
            if (mem_loc in Memory) {
                let data = Memory[mem_loc]['value']
                if (typeof (data) == 'object') {
                    while (typeof (data[0]) == 'object') {
                        data = data[0]
                    }
                    data[0] = value
                    return value
                } else {
                    Memory[mem_loc]['value'] = value
                    return value
                }
            }
            else {
                let recursive_memset = function (obj, base, top, index, value) {
                    let low = base, high = top
                    for (let i in obj) {
                        i = Number(i)
                        if (base + i > index) {
                            if (base + i < high) {
                                high = base + i
                            }
                        }
                        else if (base + i == index) {
                            if (typeof (obj[i]) != "object") {
                                obj[i] = value
                                return value
                            }
                            obj = obj[i]
                            while (typeof (obj[0]) == 'object') {
                                obj = obj[0]
                            }
                            obj[0] = value
                            return value
                        }
                        else {
                            if (low < base + i) {
                                low = base + i
                            }
                        }
                    }
                    if (typeof (obj[low - base]) != 'object') {
                        obj[index - base] = value
                        return value
                    }
                    return recursive_memset(obj[low - base], low, high, index, value)
                }
                for (let mem in Memory) {
                    mem = Number(mem)
                    if (mem <= mem_loc && mem + Memory[mem]['size'] > mem_loc) {
                        recursive_memset(Memory[mem]['value'], mem, mem + Memory[mem]['size'], mem_loc, value)
                        return value
                    }
                }
            }
            CrashNotif("Accessing Unallocated Memory")
        }
        function setVariableData(storing_variable, value) {
            if (storing_variable === undefined) {
            }
            else if (storing_variable['addr'] === undefined) {
            }
            else {
                setMemoryData(storing_variable['addr'], value)
                return
            }
            CrashNotif("Accessing Unallocated Memory")
        }
        function getVariableData(accessing_variable) {
            let temp = accessing_variable
            if (temp === undefined) {

            }
            else if (temp['type'] !== undefined && temp['type']['dtype'] !== undefined) {
                return temp['addr']
            }
            else if (temp['addr'] === undefined) {

            }
            else {
                return getMemoryData(temp['addr'])
            }
            CrashNotif({ "error word": "No Such Variable" })
        }
        function createVariable(variable_name, variable_type, scope) {
            if (getVariableIndex(variable_name, scope) !== undefined) {
                CrashNotif({ "error word": "Variable of same name already Exists" })
                return -1
            }
            if (variable_type['dtype'] !== undefined) {
                let total_size = variable_type['dims'].reduce((acc, val) => acc * val['value'], 1);
                let mem_loc = getStaticMemory(variable_type['dtype'], scope)
                Memory[mem_loc]['value'] = { 0: 0 }
                let temp_mem = getStaticMemory(variable_type['dtype'], scope)
                Memory[mem_loc]['value'][0] = Memory[temp_mem]['value']
                free_mem(temp_mem, true)
                for (let i = 1; i < total_size; i++) {
                    let temp_mem = getStaticMemory(variable_type['dtype'], scope)
                    Memory[mem_loc]['value'][Memory[mem_loc]['size']] = Memory[temp_mem]['value']
                    Memory[mem_loc]['size'] = Number(Memory[mem_loc]['size']) + Number(Memory[temp_mem]['size'])
                    free_mem(temp_mem, true)
                }
                let padded = Number(Memory[mem_loc]['size']);
                if (padded % 4 != 0) {
                    padded += 4 - padded % 4
                    Memory[mem_loc]['size'] = padded
                }
                Variables.push({ 'addr': mem_loc, 'name': variable_name, 'type': variable_type, 'scope': scope })
            }
            else {
                let mem_loc = getStaticMemory(variable_type, scope)
                Variables.push({ 'addr': mem_loc, 'name': variable_name, 'type': variable_type, 'scope': scope })
            }
            return Variables.length - 1
        }
        function malloc(size) {
            size = Number(size)
            if (isNaN(size) || size < 4) {
                size = 4
            }
            let seed = Math.floor(Math.random() * 5000) * 4
            for (let i = 0; i < 20000; i += 4) {
                let mem_loc = 6000 + (i * 999 + seed) % 20000;
                if (mem_loc + size >= 26000) {
                    continue
                }
                let is_valid = true;
                for (let key in Memory) {
                    if (Memory.hasOwnProperty(key)) {
                        let key_lb = Number(key), key_ub = Number(Memory[key]['size']) + Number(key), mem_loc_ub = mem_loc + size
                        // if ((key >= mem_loc && key < mem_loc + size) ||
                        //  (Number(Memory[key]['size']) + Number(key) > mem_loc && Number(Memory[key]['size']) + Number(key) <= mem_loc + size)) {
                        if ((key_lb <= mem_loc && mem_loc < key_ub) ||
                            (mem_loc <= key_lb && key_lb < mem_loc_ub)) {
                            is_valid = false
                            break;
                        }
                    }
                }
                if (is_valid) {
                    Memory[mem_loc] = { 'value': { 0: 0 }, 'size': size, 'scope': 0 }
                    return mem_loc
                }
            }
            return 0;
        }
        function getStaticMemory(type, scope) {
            let mem_loc = 2000
            for (let key in Memory) {
                if (Memory.hasOwnProperty(key)) {
                    if (key >= 2000 && key <= 6000 && Number(key) + Number(Memory[key]['size']) > mem_loc) {
                        mem_loc = Math.ceil((Number(key) + Number(Memory[key]['size'])) / 4) * 4
                    }
                }
            }
            let size = size_of(type)
            Memory[mem_loc] = { 'value': 0, 'size': size, 'scope': scope }
            // if (type == 'char') {
            //     Memory[mem_loc]['value'] = '\0'
            // }
            // else 
            if (type == 'struct stack') {
                Memory[mem_loc]['value'] = { 0: 0, 8: 0, 12: 0 }
            }
            else if (type == 'struct queue') {
                Memory[mem_loc]['value'] = { 0: 0, 8: 0, 12: 0, 16: 0 }
            }
            else if (type == 'struct sll') {
                Memory[mem_loc]['value'] = { 0: 0, 8: 0 }
            }
            else if (type == 'struct dll') {
                Memory[mem_loc]['value'] = { 0: 0, 8: 0, 16: 0 }
            }
            else if (type == 'struct tree') {
                Memory[mem_loc]['value'] = { 0: 0, 8: 0, 16: 0 }
            }
            else if (type.slice(-2) == '**') {
                Memory[mem_loc]['value'] = { 0: 0 }
            }
            else if (type.slice(-1) == '*') {
                Memory[mem_loc]['value'] = { 0: 0 }
            }
            else if (type['dtype'] !== undefined) {
                //it's an array

            }
            return mem_loc
        }
        function calloc(elem_num, elem_size) {
            let mem_loc = malloc(elem_size * elem_num)
            if (mem_loc == 0) {
                return 0;
            }
            Memory[mem_loc]['size'] = elem_size * elem_num
            for (let i = 0; i < elem_num; i++) {
                Memory[mem_loc]['value'][i*elem_size] = 0
            }
            return mem_loc
        }
        function size_of(type_name) {
            if (typeof (type_name) == 'string') {
                while (type_name[0] == '(' && _top(type_name) == ')') {
                    type_name = type_name.slice(1, -1)
                }
            }
            switch (type_name) {
                case 'int':
                case 'float': return 4;
                case 'char': return 1;
                case 'int*':
                case 'float*':
                case 'char*':
                case 'int**':
                case 'float**':
                case 'char**':
                case 'STACK':
                case 'struct stack*':
                case 'QUEUE':
                case 'struct queue*':
                case 'SLL':
                case 'struct sll*':
                case 'DLL':
                case 'struct dll*':
                case 'TREE':
                case 'struct tree*':
                    return 8;
                case 'struct stack': return 16;
                case 'struct queue': return 20;
                case 'struct sll': return 12;
                case 'struct dll': return 20;
                case 'struct tree': return 20;
            }
            //is array
            if (type_name === undefined) return 0
            if (_top(type_name) == '*') {
                return 8;
            }
            if (type_name.indexOf('struct') != -1) {
                // user struct
                type_name = type_name.split(' ')[1];
                if (type_name in structs) {
                    let size = 0
                    for (let param in structs[type_name]) {
                        size += size_of(structs[type_name][param][0])
                    }
                    return size;
                }
                else {
                    CrashNotif("No Such user defined Structure exists")
                }
            }
            let size = size_of(type_name['dtype'])
            for (let i = 0; i < type_name['dims'].length; i++) {
                size *= type_name['dims'][i]['value']
            }
            return size
        }
        function free_mem(mem_loc, force) {
            if (force || mem_loc >= 6000) {
                if (mem_loc in Memory) {
                    delete Memory[mem_loc]
                }
            }
        }

        function is_var_declaration(tokens) {
            function is_identifier(x) {
                if (x === undefined) return false
                return /^[_a-zA-Z][_a-zA-Z0-9]*$/.test(x)
            }
            let res = { 'is_var': true };
            let next = 0
            if (_top(tokens) != ';') {
                return { 'is_var': false }
            }
            if (DataTypes.indexOf(tokens[0]) >= 0) {
                res['type'] = tokens[0]
                next = 1
                while (tokens[next] == '*' || tokens[next] == '*deref') {
                    if (DataTypes.indexOf(res['type'] + '*') >= 0) {
                        res['type'] += '*'
                        next++;
                    }
                    else {
                        break;
                    }
                }
            }
            else if (tokens[0] == 'struct' &&
                (['stack', 'queue', 'sll', 'dll', 'tree'].indexOf(tokens[1]) != -1)
            ) {
                res['type'] = tokens[0] + " " + tokens[1];
                next = 2
                if (tokens[2] == '*') {
                    res['type'] += '*'
                    next = 3
                }
            }
            else {
                return { 'is_var': false }
            }
            if (is_identifier(tokens[next])) {
                res['first variable'] = next
                next++
            } else {
                CrashNotif({ "error word": "Wrong Syntax" })
            }
            if (tokens[next] == '(') {
                return { 'is_var': false }
            }
            return res
        }
        function printf(fmt, args) {
            let output = ""
            function $d(val) {
                if (val == undefined) {
                    return 0
                }
                else {
                    // console.log(val)
                    let temp = TypeCastInt(val)
                    output += temp.toString()
                }
            }
            function $f(val) {
                if (val == undefined) {
                    return 0
                }
                else {
                    // console.log(val)
                    let temp = TypeCastFloat(val)
                    output += temp.toFixed(6)
                }
            }
            function $c(val) {
                if (val == undefined) {
                    return 0
                }
                else {
                    // console.log(val)
                    let temp = TypeCastChar(val)
                    output += String.fromCharCode(temp)
                }
            }
            function $s(val) {
                if (val == undefined) {
                    return 0
                }
                else {
                    // console.log(val)
                    let ptr = TypeCastPointer(val)
                    while (true) {
                        let temp = getMemoryData(ptr)
                        if (!temp) {
                            break
                        }
                        output += String.fromCharCode(temp)
                        ptr++;
                    }
                }
                return 0;
            }
            let argc = 0
            if (fmt['type'] != 'string') {
                CrashNotif("First Parameter of printf has to be a string")
            }
            for (let i = 0; fmt['value'][i] != '\x00' && i < fmt['value'].length; i++) {
                if (fmt['value'][i] != '%') {
                    output += fmt['value'][i]
                }
                else {
                    switch (fmt['value'][i + 1]) {
                        case undefined:
                            output += fmt[i]
                            break
                        case 'd':
                            $d(args[argc++])
                            i++
                            break;
                        case 'f':
                            $f(args[argc++])
                            i++
                            break;
                        case 'c':
                            $c(args[argc++])
                            i++
                            break;
                        case 's':
                            $s(args[argc++])
                            i++
                            break;
                    }
                }
            }
            // console.log("output:", output)
            let cout = document.getElementById('output1')
            for (let i = 0; i < output.split('\n').length; i++) {
                let line = output.split('\n')[i];
                if (line.indexOf('\x07') != -1) {
                    // console.log(__this_obj);
                    line=line.replaceAll("\x07","");
                    __this_obj.extra_function['beep']();
                }
                // let tag = document.createElement('span')
                // tag.classList.add("Console_Line")
                // tag.textContent = line
                cout.innerHTML+=line;
                if (output.split('\n')[i + 1] != undefined) {
                    let br = document.createElement('br')
                    br.classList.add("Console_NewLine")
                    cout.appendChild(br);
                }
            }
            // for(let i=stdin.parentElement.childElementCount; i>100;i--){
            //     let c=stdin.parentElement.firstChild
            //     if(c==stdin){
            //         break;
            //     }
            //     else{
            //         stdin.parentElement.removeChild(c)
            //     }
            // }
            return output.length
        }
        async function scanf(fmt, args) {
            let no_of_inputs = 0
            function is_digit(c) {
                if (c == '0' || c == '1' || c == '2' || c == '3' || c == '4' || c == '5' || c == '6' || c == '7' || c == '8' || c == '9') return true;
                return false;
            }
            function is_alpha(c) {
                let chr = c.charCodeAt()
                if (isNaN(chr)) return false;
                if ((chr >= 65 && chr >= 90) || (chr >= 97 && chr <= 122)) return true;
                return false;
            }
            function $d(val) {
                if (val == undefined) return 0
                let res = 0, mode = 0, num = "", rem = -1;
                for (let i = 0; i < STDIN.length; i++) {
                    let char = STDIN[i]
                    if (mode == 0 && (char == ' ' || char == '\t' || char == '\n')) {
                        rem = i;
                        continue;
                    }
                    else if (mode == 0 && is_digit(char)) {
                        mode = 1;
                        num += char;
                        rem = i;
                    }
                    else if (mode == 0 && (char = '-' || char == '+')) {
                        mode = 1;
                        num += char;
                        rem = i;
                    }
                    else if (mode == 1 && is_digit(char)) {
                        num += char;
                        rem = i;
                    }
                    else if (mode == 1) {
                        mode = 2
                        break;
                    }
                }
                if (mode == 0) {
                    return 0;
                }
                STDIN = STDIN.slice(rem + 1);
                if (num != "") {
                    res = Number(num);
                    if (isNaN(res)) res = 0
                }
                if (val['type'] == 'char*') {
                    res = res % 256
                    if (res < 0) {
                        res = 255 - res
                    }
                }
                setMemoryData(val['value'], res);
                return 1;
            }
            function $f(val) {
                if (val == undefined) return 0
                let res = 0, mode = 0, num = "", rem = -1;
                for (let i = 0; i < STDIN.length; i++) {
                    let char = STDIN[i]
                    if (mode == 0 && (char == ' ' || char == '\t' || char == '\n')) {
                        rem = i;
                        continue;
                    }
                    else if (mode == 0 && (char = '-' || char == '+' || is_digit(char))) {
                        mode = 1;
                        num += char;
                        rem = i;
                    }
                    else if (mode == 0 && char == '.') {
                        mode = 2;
                        num += char;
                        rem = i;
                    }
                    else if (mode == 1 && is_digit(char)) {
                        num += char;
                        rem = i;
                    }
                    else if (mode == 1 && char == '.') {
                        mode = 2;
                        num += char;
                        rem = i;
                    }
                    else if (mode == 1) {
                        mode = 2
                        break;
                    }
                    else if (mode == 2 && is_digit(char)) {
                        num += char;
                        rem = i;
                    }
                    else if (mode == 2) {
                        break;
                    }
                }
                if (mode == 0) {
                    return 0;
                }
                STDIN = STDIN.slice(rem + 1);
                if (num != "") {
                    res = Number(num);
                    if (isNaN(res)) res = 0
                }
                if (val['type'] != 'float*') {
                    res = Math.floor(res)
                }
                if (val['type'] == 'char*') {
                    res = res % 256
                    if (res < 0) {
                        res = 255 - res
                    }
                }
                setMemoryData(val['value'], res);
                return 1;
            }
            function $c(val) {
                if (val == undefined) return 0
                if (STDIN.length == 0) return 0
                let char = STDIN[0];
                STDIN = STDIN.slice(1);
                let res = char.charCodeAt(0);
                setMemoryData(val['value'], res);
                return 1;
            }
            function $s(val) {
                if (val == undefined) return 0
                if (STDIN.length == 0) return 0
                let pos = 0
                for (; pos < STDIN.length; pos++) {
                    if (/^\S$/.test(STDIN[pos])) {
                        break;
                    }
                }
                if (pos != STDIN.length) {
                    let loc = val['value']
                    while (/^\S$/.test(STDIN[pos])) {
                        setMemoryData(loc, STDIN[pos].charCodeAt());
                        loc++;
                        pos++;
                    }
                    setMemoryData(loc, 0);
                    return 1;
                }
                STDIN = ""
                return 0;

            }
            let argc = 0
            if (fmt['type'] != 'string') {
                CrashNotif("First Parameter of scanf has to be a string")
            }
            let ExecID = extra_render_data['ExecID'];
            for (let i = 0; fmt['value'][i] != '\x00' && i < fmt['value'].length; i++) {
                if (fmt['value'][i] == '%') {
                    let arg = args[argc];
                    if (args[argc] == undefined) {
                        break;
                    }
                    switch (fmt['value'][i + 1]) {
                        case undefined:
                            break
                        case 'd':
                            while ($d(arg) == 0) {
                                await sleep(300);
                                if (ExecID != extra_render_data['ExecID']) {
                                    throw Error("Executing Program stopped during Console Read")
                                }
                            }
                            i++;
                            argc++;
                            break;
                        case 'f':
                            while ($f(arg) == 0) {
                                await sleep(300);
                                if (ExecID != extra_render_data['ExecID']) {
                                    throw Error("Executing Program stopped during Console Read")
                                }
                            }
                            i++;
                            argc++;
                            break;
                        case 'c':
                            while ($c(arg) == 0) {
                                await sleep(300);
                                if (ExecID != extra_render_data['ExecID']) {
                                    throw Error("Executing Program stopped during Console Read")
                                }
                            }
                            i++;
                            argc++;
                            break;
                        case 's':
                            while ($s(arg) == 0) {
                                await sleep(300);
                                if (ExecID != extra_render_data['ExecID']) {
                                    throw Error("Executing Program stopped during Console Read")
                                }
                            }
                            i++;
                            argc++;
                            break;
                    }
                }
            }
            return no_of_inputs
        }


        function ClearConsole() {
            STDIN = "";
            
            let cout = document.getElementById("output1");
            for (let i = cout.childNodes.length - 1; i >= 0; i--) {
                if (cout.childNodes[i].id != 'stdin') {
                    cout.removeChild(cout.childNodes[i])
                }
            }
        }


        const stacks_struct = "\nstruct stack{\n\tint * arr;\n\tint size,top;\n};\ntypedef struct stack * STACK;\n\nSTACK getStack(int size){\n\tSTACK x;\n\tx=(STACK)malloc(sizeof(struct stack));\n\tif(x==NULL){\n\t\t// Memory error\n\t\texit(0);\n\t}\n\tx->top=-1;\n\tx->size=size;\n\tx->arr=(int *)malloc(sizeof(int)*size);\n\treturn x;\n};\n\n"
        const queue_struct = "\nstruct queue{\n\tint * arr;\n\tint size,rear,front;\n};\ntypedef struct queue * QUEUE;\n\nQUEUE getQueue(int size){\n\tQUEUE x;\n\tx=(QUEUE)malloc(sizeof(struct queue));\n\tif(x==NULL){\n\t\t// Memory error\n\t\texit(0);\n\t}\n\tx->front=-1;\n\tx->rear=0;\n\tx->size=size;\n\tx->arr=(int *)malloc(sizeof(int)*size);\n\treturn x;\n};\n\n"
        const SLL_struct = "\nstruct sll{\n\tstruct sll * next;\n\tint info;\n};\ntypedef struct sll * SLL;\n\nSLL getSll(){\n\tSLL x;\n\tx=(SLL)malloc(sizeof(struct sll));\n\tif(x==NULL){\n\t\t// Memory error\n\t\texit(0);\n\t}\n\tx->next=NULL;\n\tx->info=0;\n\treturn x;\n};\n\n"
        const DLL_struct = "\nstruct dll{\n\tstruct dll * next;\n\tstruct dll * prev;\n\tint info;\n};\ntypedef struct dll * DLL;\n\nDLL getDll(){\n\tDLL x;\n\tx=(DLL)malloc(sizeof(struct dll));\n\tif(x==NULL){\n\t\t// Memory error\n\t\texit(0);\n\t}\n\tx->next=NULL;\n\tx->prev=NULL;\n\tx->info=0;\n\treturn x;\n};\n\n"
        const Tree_struct = "\nstruct tree{\n\tstruct tree * left;\n\tstruct tree * right;\n\tint info;\n};\ntypedef struct tree * TREE;\n\nTREE getTree(){\n\tTREE x;\n\tx=(TREE)malloc(sizeof(struct tree));\n\tif(x==NULL){\n\t\t// Memory error\n\t\texit(0);\n\t}\n\tx->left=NULL;\n\tx->right=NULL;\n\tx->info=0;\n\treturn x;\n};\n\n"
        const inbuilt_structs = Object.freeze({
            'stack': {
                "arr": ("int*", 0),
                "size": ("int", 8),
                "top": ("int", 12)
            },
            'queue': {
                "arr": ("int*", 0),
                "size": ("int", 8),
                "rear": ("int", 12),
                "front": ("int", 16)
            },
            "sll": {
                "next": ("struct sll*", 0),
                "info": ("int", 8)
            },
            "dll": {
                "next": ("struct dll*", 0),
                "prev": ("struct dll*", 8),
                "info": ("int", 16)
            },
            "tree": {
                "left": ("struct tree*", 0),
                "right": ("struct tree*", 8),
                "info": ("int", 16)
            }
        })
        var structs = {}
        var typedefs = {}
        var functions = {}
        var Cin_text = "int main(){\n\treturn 0;\n}"
        const NULL = Object.freeze({ 'addr': 0, 'name': "NULL", 'value': 0, 'type': 'void', 'scope': 0, 'div': 0 })
        var Variables = []
        var Memory = {}
        var Branch_stack = [{ "keyword": "function", "scope": 1 }]
        var DataTypes = ["int",
            "float",
            "char",
            "int*",
            "char*",
            "float*",
            "struct stack",
            "struct queue",
            "struct sll",
            "struct dll",
            "struct tree",
            "struct stack*",
            "struct queue*",
            "struct sll*",
            "struct dll*",
            "struct tree*",
            "SLL",
            "DLL",
            "TREE",
            "STACK",
            "QUEUE",
            "void"
        ]
        var Program = []
        var datatypeExp = ""
        // var scope=0
        var sleepTime = 300
        var PAUSE_EXEC = false
        var extra_render_data = {}
        var STDIN = ""
        const sleep = async function (ms) {
            if (ms === undefined) {
                let passed_time = 0, period = 100;
                if (sleepTime < 100) {
                    await new Promise(r => setTimeout(r, sleepTime));
                    return
                }
                while (passed_time < sleepTime) {
                    await new Promise(r => setTimeout(r, 100));
                    passed_time += 100
                }
            }
            else {
                let passed_time = 0
                while (passed_time < ms) {
                    await new Promise(r => setTimeout(r, 100));
                    passed_time += 100
                }
            }
            return
        }
        function Cout_handler(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                let cout = this.parentElement
                let tag = document.createElement('span')
                tag.classList.add('STDIN_entered_line')
                tag.textContent = this.textContent
                STDIN += this.textContent + '\n'
                this.textContent = ""
                cout.insertBefore(tag, this)
                cout.insertBefore(document.createElement('br'), this)
                this.focus();
            }
        }
        // setTimeout(() => {
        //     // document.getElementById("Cin").value=stacks_struct+document.getElementById("Cin").value;
        //     // document.getElementById("Cin").addEventListener('keydown', handleKey, true);
        //     document.getElementById("stdin").addEventListener('keydown', Cout_handler, true);
        //     document.getElementById("Cout").addEventListener('click', () => document.getElementById("stdin").focus(), true);
        //     let i = document.getElementById("Cin");
        //     i.scrollTop = i.scrollHeight;
        //     highlightExecution();
        // }, 100);
        let _pgrm='';
        for(let i=0;i<_lines.length;i++){
            _pgrm+=_lines[i][1];
        }
        console.log(_pgrm);
        compile(_pgrm);
        PAUSE_EXEC=false;
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
            let snd = new Audio("data:audio/mp3;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7xA4Tvh9Rz/y8QADBwMWgQAZG/ILNAARQ4GLTcDeIIIhxGOBAuD7hOfBB3/94gcJ3w+o5/5eIAIAAAVwWgQAVQ2ORaIQwEMAJiDg95G4nQL7mQVWI6GwRcfsZAcsKkJvxgxEjzFUgfHoSQ9Qq7KNwqHwuB13MA4a1q/DmBrHgPcmjiGoh//EwC5nGPEmS4RcfkVKOhJf+WOgoxJclFz3kgn//dBA+ya1GhurNn8zb//9NNutNuhz31f////9vt///z+IdAEAAAK4LQIAKobHItEIYCGAExBwe8jcToF9zIKrEdDYIuP2MgOWFSE34wYiR5iqQPj0JIeoVdlG4VD4XA67mAcNa1fhzA1jwHuTRxDUQ//iYBczjHiTJcIuPyKlHQkv/LHQUYkuSi57yQT//uggfZNajQ3Vmz+Zt//+mm3Wm3Q576v////+32///5/EOgAAADVghQAAAAA//uQZAUAB1WI0PZugAAAAAoQwAAAEk3nRd2qAAAAACiDgAAAAAAABCqEEQRLCgwpBGMlJkIz8jKhGvj4k6jzRnqasNKIeoh5gI7BJaC1A1AoNBjJgbyApVS4IDlZgDU5WUAxEKDNmmALHzZp0Fkz1FMTmGFl1FMEyodIavcCAUHDWrKAIA4aa2oCgILEBupZgHvAhEBcZ6joQBxS76AgccrFlczBvKLC0QI2cBoCFvfTDAo7eoOQInqDPBtvrDEZBNYN5xwNwxQRfw8ZQ5wQVLvO8OYU+mHvFLlDh05Mdg7BT6YrRPpCBznMB2r//xKJjyyOh+cImr2/4doscwD6neZjuZR4AgAABYAAAABy1xcdQtxYBYYZdifkUDgzzXaXn98Z0oi9ILU5mBjFANmRwlVJ3/6jYDAmxaiDG3/6xjQQCCKkRb/6kg/wW+kSJ5//rLobkLSiKmqP/0ikJuDaSaSf/6JiLYLEYnW/+kXg1WRVJL/9EmQ1YZIsv/6Qzwy5qk7/+tEU0nkls3/zIUMPKNX/6yZLf+kFgAfgGyLFAUwY//uQZAUABcd5UiNPVXAAAApAAAAAE0VZQKw9ISAAACgAAAAAVQIygIElVrFkBS+Jhi+EAuu+lKAkYUEIsmEAEoMeDmCETMvfSHTGkF5RWH7kz/ESHWPAq/kcCRhqBtMdokPdM7vil7RG98A2sc7zO6ZvTdM7pmOUAZTnJW+NXxqmd41dqJ6mLTXxrPpnV8avaIf5SvL7pndPvPpndJR9Kuu8fePvuiuhorgWjp7Mf/PRjxcFCPDkW31srioCExivv9lcwKEaHsf/7ow2Fl1T/9RkXgEhYElAoCLFtMArxwivDJJ+bR1HTKJdlEoTELCIqgEwVGSQ+hIm0NbK8WXcTEI0UPoa2NbG4y2K00JEWbZavJXkYaqo9CRHS55FcZTjKEk3NKoCYUnSQ0rWxrZbFKbKIhOKPZe1cJKzZSaQrIyULHDZmV5K4xySsDRKWOruanGtjLJXFEmwaIbDLX0hIPBUQPVFVkQkDoUNfSoDgQGKPekoxeGzA4DUvnn4bxzcZrtJyipKfPNy5w+9lnXwgqsiyHNeSVpemw4bWb9psYeq//uQZBoABQt4yMVxYAIAAAkQoAAAHvYpL5m6AAgAACXDAAAAD59jblTirQe9upFsmZbpMudy7Lz1X1DYsxOOSWpfPqNX2WqktK0DMvuGwlbNj44TleLPQ+Gsfb+GOWOKJoIrWb3cIMeeON6lz2umTqMXV8Mj30yWPpjoSa9ujK8SyeJP5y5mOW1D6hvLepeveEAEDo0mgCRClOEgANv3B9a6fikgUSu/DmAMATrGx7nng5p5iimPNZsfQLYB2sDLIkzRKZOHGAaUyDcpFBSLG9MCQALgAIgQs2YunOszLSAyQYPVC2YdGGeHD2dTdJk1pAHGAWDjnkcLKFymS3RQZTInzySoBwMG0QueC3gMsCEYxUqlrcxK6k1LQQcsmyYeQPdC2YfuGPASCBkcVMQQqpVJshui1tkXQJQV0OXGAZMXSOEEBRirXbVRQW7ugq7IM7rPWSZyDlM3IuNEkxzCOJ0ny2ThNkyRai1b6ev//3dzNGzNb//4uAvHT5sURcZCFcuKLhOFs8mLAAEAt4UWAAIABAAAAAB4qbHo0tIjVkUU//uQZAwABfSFz3ZqQAAAAAngwAAAE1HjMp2qAAAAACZDgAAAD5UkTE1UgZEUExqYynN1qZvqIOREEFmBcJQkwdxiFtw0qEOkGYfRDifBui9MQg4QAHAqWtAWHoCxu1Yf4VfWLPIM2mHDFsbQEVGwyqQoQcwnfHeIkNt9YnkiaS1oizycqJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
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
        'line_splitter': function (txt) {
            let out = txt.split('\n');
            for (let i = 0; i < out.length; i++) {
                out[i] = [i, out[i]]
            }
            return out;
        },
        'line_merger': function (lines) {
            let out='';
            for (let i = 0; i < lines.length; i++) {
                out+=lines[i][1]+'\n';
            }
            return out;
        }
    }
}
var Interpreter = new __interpreter();