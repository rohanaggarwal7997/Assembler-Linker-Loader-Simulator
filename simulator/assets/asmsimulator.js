var app = angular.module('ASMSimulator', []);

;app.service('cpu', [ 'memory', function( memory) {
    var cpu = {
        step: function(asmCode,curLine) {
            var self = this;

            if (self.fault === true) {
                throw "FAULT. Reset to continue.";
            }

            try {
                
                

                var jump = function(newIP) {
                    if (newIP < 0 || newIP >= memory.data.length) {
                        throw "IP outside memory";
                    } else {
                        self.ip = newIP;
                    }
                };

                var push = function(value) {
                    memory.store(self.sp--, value);
                    if (self.sp < self.minSP) {
                        throw "Stack overflow";
                    }
                };

                var pop = function() {
                    var value = memory.load(++self.sp);
                    if (self.sp > self.maxSP) {
                    	self.sp  = self.maxSP;
                    }

                    return value;
                };
                
                

				
				var instr = asmCode[curLine];
				
				var loopCheck = /^(L[0-9]+)(.*)$/;
				Loop = loopCheck.exec(instr);
				if(Loop) instr = Loop[2].trim();
				
				var ifCheck = /^(I[0-9]+)(.*)$/;
				IF = ifCheck.exec(instr);
				if(IF) instr = IF[2].trim();
				
				var pCheck = /^(P[0-9]+)(.*)$/;
				P = pCheck.exec(instr);
				if(P) instr = P[2].trim();
				
                console.log(instr);
				
				var regtoInt = {};
				regtoInt["Areg"]=0;
				regtoInt["Breg"]=1;
				regtoInt["Dreg"]=2;
				regtoInt["Ereg"]=3;
				
				
				if(instr.startsWith("HLT") || instr.startsWith("PASS")) return curLine+1;
				
				if(instr.startsWith("MOV")){
					var reg1 = instr.substring(4,8);
					var reg2 = instr.substring(10,instr.length);
					
					
					self.gpr[regtoInt[reg1]] = self.gpr[regtoInt[reg2]];
					
					if( parseInt(self.gpr[0],10) > 0 ) self.positive = true;
					else self.positive = false;
                	if(parseInt(self.gpr[0],10) === 0) self.zero = true;
					else self.zero = false;
					
                	return curLine+1;
                	
                }
				
				if(instr.startsWith("MVI")){
					var reg1 = instr.substring(4,8);
					var val = instr.substring(10,instr.length);
					val = parseInt(val,10);
					
					self.gpr[regtoInt[reg1]] = val;
					
					
					if( parseInt(self.gpr[0],10) > 0 ) self.positive = true;
					else self.positive = false;
                	if(parseInt(self.gpr[0],10) === 0) self.zero = true;
					else self.zero = false;
					
                	return curLine+1;
                	
                }
				
				if(instr.startsWith("STA")){
					var val = instr.substring(4,instr.length);
					val = parseInt(val,10);
					
					memory.store(val,parseInt(self.gpr[0],10));
					
                	return curLine+1;
                	
                }
				
				if(instr.startsWith("LDA")){
					var val = instr.substring(4,instr.length);
					val = parseInt(val,10);
					
					self.gpr[0] = memory.load(val); 
					
					if( parseInt(self.gpr[0],10) > 0 ) self.positive = true;
					else self.positive = false;
                	if(parseInt(self.gpr[0],10) === 0) self.zero = true;
					else self.zero = false;
					
                	return curLine+1;
                	
                }
				
				if(instr.startsWith("PUSH")){
					var val = self.gpr[3];
					push(parseInt(val,10));
					
                	return curLine+1;
                	
                }
				
				if(instr.startsWith("POP")){
					self.gpr[3] = pop();
					
                	return curLine+1;
                	
                }
				
				if(instr.startsWith("JNZ")){
					var val = instr.substring(4,instr.length);
					val = parseInt(val,10);
					
					if(self.zero) return curLine+1;
					return val;
                	
                }
				
				if(instr.startsWith("JZ")){
					var val = instr.substring(3,instr.length);
					val = parseInt(val,10);
					
					if(self.zero) return val;
					return curLine+1;
                	
                }
				
				if(instr.startsWith("JP")){
					var val = instr.substring(3,instr.length);
					val = parseInt(val,10);
					
					if(self.positive) return val;
					return curLine+1;               	
                }
				
				
				
                if(instr.startsWith("ADD")){
                	var regAdd = instr.substring(4,instr.length);
                	if(regAdd == "Areg"){
                		self.gpr[0]=parseInt(self.gpr[0],10)+parseInt(self.gpr[0],10);
                	}
                	else if(regAdd == "Breg"){
                		self.gpr[0]=parseInt(self.gpr[0],10)+parseInt(self.gpr[1],10);
                	}
                	else if(regAdd == "Dreg"){
                		self.gpr[0]=parseInt(self.gpr[0],10)+parseInt(self.gpr[2],10);
                	}
                	else{
                		self.gpr[0]=parseInt(self.gpr[0],10)+parseInt(self.gpr[3],10);
                	}
                	
					if( parseInt(self.gpr[0],10) > 0 ) self.positive = true;
					else self.positive = false;
                	if(parseInt(self.gpr[0],10) === 0) self.zero = true;
					else self.zero = false;

                	return curLine+1;
                	
                }
				
				if(instr.startsWith("ADI")){
                	var regAdd = instr.substring(4,instr.length);
					var val = parseInt(regAdd,10);
					
					console.log("HEY");
					console.log(self.gpr[0]);
					console.log(val);
					console.log("HEY");
					console.log(typeof(self.gpr[0]));
					console.log(typeof(val));
                	
					
					
                	self.gpr[0]=parseInt(self.gpr[0],10)+val;
                	
                	
					if( parseInt(self.gpr[0],10) > 0 ) self.positive = true;
					else self.positive = false;
                	if(parseInt(self.gpr[0],10) === 0) self.zero = true;
					else self.zero = false;
                	return curLine+1;
                	
                }
				
				if(instr.startsWith("SUB")){
                	var regAdd = instr.substring(4,instr.length);
                	if(regAdd == "Areg"){
                		self.gpr[0]=parseInt(self.gpr[0],10)-parseInt(self.gpr[0],10);
                	}
                	else if(regAdd == "Breg"){
                		self.gpr[0]=parseInt(self.gpr[0],10)-parseInt(self.gpr[1],10);
                	}
                	else if(regAdd == "Dreg"){
                		self.gpr[0]=parseInt(self.gpr[0],10)-parseInt(self.gpr[2],10);
                	}
                	else{
                		self.gpr[0]=parseInt(self.gpr[0],10)-parseInt(self.gpr[3],10);
                	}
                	
					if( parseInt(self.gpr[0],10) > 0 ) self.positive = true;
					else self.positive = false;
                	if(parseInt(self.gpr[0],10) === 0) self.zero = true;
					else self.zero = false;
                	return curLine+1;
                	
                }
				
				if(instr.startsWith("SUI")){
                	var regAdd = instr.substring(4,instr.length);
					var val = parseInt(regAdd,10);
						
					
                	self.gpr[0]=parseInt(self.gpr[0],10)-val;
                	
                	
					if( parseInt(self.gpr[0],10) > 0 ) self.positive = true;
					else self.positive = false;
                	if(parseInt(self.gpr[0],10) === 0) self.zero = true;
					else self.zero = false;
					

                	return curLine+1;
                	
                }
				
				if(instr.startsWith("AND")){
                	var regAdd = instr.substring(4,instr.length);
                	if(regAdd == "Areg"){
                		self.gpr[0]=parseInt(self.gpr[0],10)&parseInt(self.gpr[0],10);
                	}
                	else if(regAdd == "Breg"){
                		self.gpr[0]=parseInt(self.gpr[0],10)&parseInt(self.gpr[1],10);
                	}
                	else if(regAdd == "Dreg"){
                		self.gpr[0]=parseInt(self.gpr[0],10)&parseInt(self.gpr[2],10);
                	}
                	else{
                		self.gpr[0]=parseInt(self.gpr[0],10)&parseInt(self.gpr[3],10);
                	}
                	
					if( parseInt(self.gpr[0],10) > 0 ) self.positive = true;
					else self.positive = false;
                	if(parseInt(self.gpr[0],10) === 0) self.zero = true;
					else self.zero = false;

                	return curLine+1;
                	
                }
				
				if(instr.startsWith("ANI")){
                	var regAdd = instr.substring(4,instr.length);
					var val = parseInt(regAdd,10);
						
					
                	self.gpr[0]=parseInt(self.gpr[0],10)&val;
                	
                	
					if( parseInt(self.gpr[0],10) > 0 ) self.positive = true;
					else self.positive = false;
                	if(parseInt(self.gpr[0],10) === 0) self.zero = true;
					else self.zero = false;

                	return curLine+1;
                	
                }if(instr.startsWith("ORA")){
                	var regAdd = instr.substring(4,instr.length);
                	if(regAdd == "Areg"){
                		self.gpr[0]=parseInt(self.gpr[0],10)|parseInt(self.gpr[0],10);
                	}
                	else if(regAdd == "Breg"){
                		self.gpr[0]=parseInt(self.gpr[0],10)|parseInt(self.gpr[1],10);
                	}
                	else if(regAdd == "Dreg"){
                		self.gpr[0]=parseInt(self.gpr[0],10)|parseInt(self.gpr[2],10);
                	}
                	else{
                		self.gpr[0]=parseInt(self.gpr[0],10)|parseInt(self.gpr[3],10);
                	}
                	
					if( parseInt(self.gpr[0],10) > 0 ) self.positive = true;
					else self.positive = false;
                	if(parseInt(self.gpr[0],10) === 0) self.zero = true;
					else self.zero = false;
					

                	return curLine+1;
                	
                }
				
				if(instr.startsWith("ORI")){
                	var regAdd = instr.substring(4,instr.length);
					var val = parseInt(regAdd,10);
						
					
                	self.gpr[0]=parseInt(self.gpr[0],10)|val;
                	
                	
					if( parseInt(self.gpr[0],10) > 0 ) self.positive = true;
					else self.positive = false;
                	if(parseInt(self.gpr[0],10) === 0) self.zero = true;
					else self.zero = false;
					

                	return curLine+1;
                	
                }

                
                
            } catch(e) {
                self.fault = true;
                throw e;
            }
        },
        reset: function() {
            var self = this;
            self.maxSP = 231;
            self.minSP = 0;

            self.gpr = new Array(0,0,0,0);
			
            self.sp = self.maxSP;
            self.zero = true;
            self.positive = false;
            self.fault = false;
        }
    };

    cpu.reset();
    return cpu;

    


}]);
;app.service('memory', [function () {
    var memory = {
        data: Array(256),
        lastAccess: -1,
        load: function (address) {
            var self = this;

            if (address < 0 || address >= self.data.length) {
                throw "Memory access violation at " + address;
            }

            self.lastAccess = address;
            return self.data[address];
        },
        store: function (address, value) {
            var self = this;

            if (address < 0 || address >= self.data.length) {
                throw "Memory access violation at " + address;
            }

            self.lastAccess = address;
            self.data[address] = value;
        },
        reset: function () {
            var self = this;

            self.lastAccess = -1;
            for (var i = 0, l = self.data.length; i < l; i++) {
                self.data[i] = 0;
            }
        }
    };

    memory.reset();
    return memory;
}]);

;app.controller('Ctrl', ['$document', '$scope', '$timeout', 'cpu', 'memory' ,function ($document, $scope, $timeout, cpu, memory ) {
    $scope.memory = memory;
    $scope.cpu = cpu;
    $scope.error = '';
    $scope.isRunning = false;
    $scope.displayHex = true;
    $scope.displayA = false;
    $scope.displayB = false;
    $scope.displayC = false;
    $scope.displayD = false;
    $scope.speeds = [{speed: 1, desc: "1 HZ"},
                     {speed: 4, desc: "4 HZ"},
                     {speed: 8, desc: "8 HZ"},
                     {speed: 16, desc: "16 HZ"}];
	$scope.speed = 4;
    $scope.selectedLine = 0;
    $scope.execLine = 0;
    $scope.labels = {};

    $scope.code = "ADD Areg\nADD Breg\nADD Ereg";
	
    $scope.reset = function () {
        cpu.reset();
        memory.reset();
        $scope.error = '';
        $scope.selectedLine = 0;
        $scope.execLine = 0;
		$scope.labels = {};

        var lines = $scope.code.split("\n");
    	var DC = /^(.*?)DC(.*)$/;
    	for (var i = 0; i < lines.length; i++) {
    		m = DC.exec(lines[i]);
    		if(m){
    			varname = m[1].trim();
    			val = m[2].trim();
    			address = i;
    			$scope.labels[varname] = address;
    			memory.store(address,val);

    		}
    	}
        
    };

    $scope.executeStep = function () {
        

        try {
            // Execute
            if($scope.execLine >= $scope.code.split('\n').length)
            	return true;

    		
			$scope.selectedLine = $scope.execLine;
			
            $scope.execLine = cpu.step($scope.code.split('\n'),$scope.execLine,$scope.labels);
            
            $scope.selectedLine = $scope.execLine;
			
	        var DC = /^(.*?)DC(.*)$/;
            
			while($scope.execLine < $scope.code.split('\n').length){
				m = DC.exec($scope.code.split('\n')[$scope.execLine]);
				if(m) $scope.execLine++;
				else break;
			}
			
			$scope.selectedLine = $scope.execLine;
			
            // Mark in code

            return true;
        } catch (e) {
            $scope.error = e;
            return false;
        }
    };

    var runner;
    $scope.run = function () {
     
        $scope.isRunning = true;
        runner = $timeout(function () {
            if ($scope.executeStep() === true) {
                $scope.run();
            } else {
                $scope.isRunning = false;
            }
        }, 1000 / $scope.speed);
    };

    $scope.stop = function () {
        $timeout.cancel(runner);
        $scope.isRunning = false;
    };


    $scope.getChar = function (value) {
        var text = String.fromCharCode(value);

        if (text.trim() === '') {
            return '\u00A0\u00A0';
        } else {
            return text;
        }
    };

    

    $scope.jumpToLine = function (index) {
        $document[0].getElementById('sourceCode').scrollIntoView();
        $scope.selectedLine = index;
    };


    

    $scope.getMemoryCellCss = function (index) {
        if (index > cpu.sp && index <= cpu.maxSP) {
            return 'stack-bg';
        } else {
            return 'instr-bg';
        }
    };

    $scope.getMemoryInnerCellCss = function (index) {
        if (index === cpu.sp) {
            return 'marker marker-sp';
        } else if (index === cpu.gpr[0] && $scope.displayA) {
            return 'marker marker-a';
        } else if (index === cpu.gpr[1] && $scope.displayB) {
            return 'marker marker-b';
        } else if (index === cpu.gpr[2] && $scope.displayC) {
            return 'marker marker-c';
        } else if (index === cpu.gpr[3] && $scope.displayD) {
            return 'marker marker-d';
        } else {
            return '';
        }
    };
}]);
;app.filter('flag', function() {
    return function(input) {
        return input.toString().toUpperCase();
    };
});
;app.filter('number', function() {
    return function(input, isHex) {
        if (isHex) {
            var hex = input.toString(16).toUpperCase();
            return hex.length == 1 ? "0" + hex: hex;
        } else {
            return input.toString(10);
        }
    };
});
// Source: http://lostsource.com/2012/11/30/selecting-textarea-line.html
;app.directive('selectLine', [function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs, controller) {
            scope.$watch('selectedLine', function () {
                if (scope.selectedLine >= 0) {
                    var lines = element[0].value.split("\n");

                    // Calculate start/end
                    var startPos = 0;
                    for (var x = 0; x < lines.length; x++) {
                        if (x == scope.selectedLine) {
                            break;
                        }
                        startPos += (lines[x].length + 1);
                    }

                    var endPos = lines[scope.selectedLine].length + startPos;

                    // Chrome / Firefox
                    if (typeof(element[0].selectionStart) != "undefined") {
                        element[0].focus();
                        element[0].selectionStart = startPos;
                        element[0].selectionEnd = endPos;
                    }

                    // IE
                    if (document.selection && document.selection.createRange) {
                        element[0].focus();
                        element[0].select();
                        var range = document.selection.createRange();
                        range.collapse(true);
                        range.moveEnd("character", endPos);
                        range.moveStart("character", startPos);
                        range.select();
                    }
                }
            });
        }
    };
}]);
;app.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    };
});
;app.directive('tabSupport', [function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs, controller) {
            element.bind("keydown", function (e) {
                if (e.keyCode === 9) {
                    var val = this.value;
                    var start = this.selectionStart;
                    var end = this.selectionEnd;

                    this.value = val.substring(0, start) + '\t' + val.substring(end);
                    this.selectionStart = this.selectionEnd = start + 1;

                    e.preventDefault();
                    return false;
                }
            });
        }
    };
}]);

