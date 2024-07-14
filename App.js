import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useState, useRef } from 'react'


export default function App() {
  const BUTTON_ARR = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  const [isTime, setIsTime] = useState(false);
  const [currentNum, setCurrentNum] = useState("")
  const [numUnaltered, setNum] = useState("")
  const [equation, setEquation] = useState([]);
  const [isAnswer, setIsAnswer] = useState(false);
  const [prevAnswer, setPrevAnswer] = useState(0)
  const [parenthesisOpen, setParenthesisOpen] = useState(0)

  const NumberBtn = (props) => {
    return (
      <TouchableOpacity style={styles.circle} onPress={() => pushNum(props.num)}>
        <Text style={styles.text}>{props.num}</Text>
      </TouchableOpacity>
    )
  }

  const solveEquation = (eq) => {
    while (eq.includes("(")) {
      let firstPar = eq.indexOf("(")
      let secondPar = 0
      let open = 0
      for (let i = 0; i < eq.length; i++) {
        if (eq[i] == "(") {
          open += 1
        } else if (eq[i] == ")") {
          open -= 1
          if (open < 0) {
            secondPar = i
            break;
          }
        }
      }

      if (secondPar == 0) {
        eq.push(")")
        secondPar = eq.length - 1
      }
      let subEq = eq.slice(firstPar+1,secondPar)
      console.log(subEq)
      if (subEq.length > 1) {
        subEq = solveEquation(eq.slice(firstPar+1,secondPar))
      }
      eq.splice(firstPar, (secondPar-firstPar) + 1, ...subEq)
    }

    let before = eq[0];
    let i = 1;

    while (eq.includes("×") || eq.includes("÷")) {
      if (eq[i] == "×") {
        before *= eq[i+1];
        eq.splice(i-1,3,before)
      } else if (eq[i] == "÷") {
        before /= eq[i+1];
        eq.splice(i-1,3,before)
      } else {
        i += 2;
        before = eq[i-1]
      }
      console.log(eq)
    }

    before = parseFloat(eq[0]);
    i = 1;
    while (eq.includes("+") || eq.includes("-")) {
      if (eq[i] == "+") {
        before += parseFloat(eq[i+1]);
        eq.splice(i-1,3,before)
      } else if (eq[i] == "-") {
        before -= eq[i+1];
        eq.splice(i-1,3,before)
      } else {
        i += 2;
        before = eq[i-1]
      }
    }

    return eq
  }

  const clearPressed = () => {
    let eq = [...equation]
    eq.length = 0;
    setEquation(eq)
    setCurrentNum("");
    setIsTime(false);
    setParenthesisOpen(0)
    setNum("")
  }
  const parenthesisPressed = () => {
    console.log(parenthesisOpen)
    // how to allow for nested parenthesis??????
    if (parenthesisOpen == 0 && (currentNum != "" || equation[equation.length - 1] == ")")) {
      pushSymbol("×(")
      //pushSymbol("(")
      setParenthesisOpen(parenthesisOpen + 1)
    } else if (currentNum == "" && equation[equation.length - 1] != ")") {
      pushSymbol("(")
      setParenthesisOpen(parenthesisOpen + 1)
    } else if (parenthesisOpen != 0) {
      pushSymbol(")")
      setParenthesisOpen(parenthesisOpen - 1)
    }
  }

  const posNegPressed = () => {
    if (currentNum == "-") {
      setNum("")
      setCurrentNum("")
      return;
    } else if (currentNum !== "") {
      pushSymbol("×")
    } 
    setNum("-")
    setCurrentNum("-")
  }
  const equalsPressed = () => {
    let eq = equation
    if (!(eq[eq.length - 1] == ")" && numUnaltered == "")) {
      eq.push(numUnaltered)
    }
    setEquation(eq)

    let containsTime = false;

    console.log(eq)
    // turn decimals into numbers
    while (eq.includes(".")) {
      let dotIndex = eq.indexOf(".");
      let firstNum = eq[dotIndex - 1];

      //console.log(dotIndex)
      eq.splice(dotIndex-1, dotIndex + 2, parseFloat(firstNum + "." + eq[dotIndex + 1]))
      console.log(equation)
    }

    // replace all commas
    for (let i = 0; i < eq.length; i++) {
      try { 
        eq[i] = eq[i].replace(",","")
      } catch {}
    }

    console.log(eq)


    let startIndex = 0;
    let currentIndex = 0;
    let current = 0;
    let hasParenthesis = false;

    console.log(eq)
    while (currentIndex < eq.length) {
      if (eq[currentIndex] == ":") {
        containsTime = true
      } else if (eq[currentIndex] == "(") {
        startIndex++
      } else if (isNaN(parseInt(eq[currentIndex]))) {
        // console.log(eq)
        if (!hasParenthesis) {
          if (eq[currentIndex] == ")") {
            hasParenthesis = true
          }
          eq.splice(startIndex, currentIndex-startIndex, current)
          current = 0
          currentIndex = startIndex + 1
          startIndex += 2
        } else {
          hasParenthesis = false
          startIndex += 1
        }
      } else {
        current *= 60
        current += parseFloat(eq[currentIndex])  
      }
      currentIndex++
    }
    
    if (eq[eq.length - 1] != ")") {  
      eq.splice(startIndex,currentIndex-startIndex,current)
    }
    console.log(eq)

    eq = solveEquation(eq)    

    if (containsTime) {
      let timeStr = []
      let num = eq[0];

      if (num < 10) {
        let numSplit = num.toString().split(".")
        timeStr.push("0")
        timeStr.push(":")
        if (numSplit[0].length == 1) {
          numSplit[0] = "0" + numSplit[0]
          console.log(numSplit)
        }
        timeStr.push(numSplit[0])
        timeStr.push(".")
        timeStr.push(numSplit[1])
      } else {
        while (num >= 60) {
          let curNum = num % 60;
          if (curNum < 10) {
            curNum = "0" + curNum
          }
          timeStr.splice(0,0,":")
          timeStr.splice(1,0,curNum)
          num = Math.floor(num/60)
        }
        timeStr.splice(0,0,num)
      }

      eq = timeStr
    }
    if (eq[eq.length - 1].toString().length > 11) {
      eq[eq.length - 1] = eq[eq.length - 1].toString().substring(0, 11)
    }

    setIsAnswer(true)
    setCurrentNum(eq[eq.length-1])
    setNum(eq[eq.length-1])
    eq.pop(eq.length-1)
    setEquation(eq)
  }

  const backSpacePressed = () => {
    if (currentNum != "") {
      let newNum = numUnaltered.substring(0, numUnaltered.length - 1);
      if (isNaN(newNum)) {
        setCurrentNum("")
        setNum("")
      } else { 
        setNum(newNum)
        setCurrentNum(formatNum(newNum, newNum.toString().length));
      }
    } else if (equation.length > 0) {
      let eq = equation;
      if (equation.at(equation.length - 1).length == 1) {
        if (eq[eq.length - 1] == ")") {
          setParenthesisOpen(parenthesisOpen + 1)
        } else if (eq[eq.length - 1] == "(") {
          setParenthesisOpen(parenthesisOpen - 1)
        }
        eq.splice(equation.length-1, 1)
        let newNum = eq.splice(equation.length-1, 1).at(0);
        newNum = newNum.toString().replace(",","")
        setCurrentNum(formatNum(newNum, newNum.toString().length))
        setNum(newNum)
      }
    }
  }

  const pushSymbol = (symbol) => {
    setIsAnswer(false)

    // prevent colons to be added after decimals
    if (symbol == ":" && equation.length > 1 && equation[equation.length-1] == ".") {
      return;
    }

    let eq = [...equation];
    let curNum = currentNum

    // add 0s to keep formatting in time
    if ((symbol == ":"  || isTime) && currentNum.length == 1) {
      curNum = "0" + currentNum
    }

    if (symbol == ":" && curNum == "") {
      eq.push("0")
      eq.push(":")
    } else if (currentNum != "" || equation[equation.length - 1] == ")" || symbol == "(") {
      if (symbol == ":" && curNum.length > 2) {
        // reformat current number to time when colon pressed
        let list = []
        curNum = curNum.replace(",","")

        // divides out into pairs starting with first or second num
        if (curNum.length % 2 == 0) {
          list = curNum.match(/.{2}/g)  
        } else {
          let first = curNum[0]
          list = curNum.substring(1).match(/.{2}/g)
          list.splice(0,0,first)
        }

        // adds all of the colons
        list.forEach((i) => {
          eq.push(i)
          eq.push(":")
        })
      } else {
        // if its a normal symbol add it
        if (equation[equation.length - 1] != ")" && symbol != "(") {
          eq.push(curNum);
        }
        if (symbol == "×(") {
          eq.push("×")
          symbol = "("
        }
        eq.push(symbol)
      }

      // reset current number being typed
      setCurrentNum("");
      setNum("")
    } else if (symbol == ".") {
      // add 0 if needed before decimal
      let addedZeros = "0"
      if (isTime) {
        addedZeros += "0"
      }
      eq.push(addedZeros)
      eq.push(".")
    }

    // reset isTime if we move to a new number
    if (symbol != ":") { 
      setIsTime(false)
    }
    setEquation(eq)
  }

  const formatNum = (num, length) => {
    let altered = ""
    for (let i = length - 3; i >= 1; i -= 3) {
      altered = "," + num.substring(i) + altered;
      num = num.substring(0, i)
    }
    altered = num + altered;
    return altered
  }

  const pushNum = (addedNumber) => {
    if (equation[equation.length-1] == ")") {
      return;
    }
    let newNumber = numUnaltered + addedNumber;
    if (isAnswer) {
      newNumber = addedNumber;
    }
    let altered = ""
    let isDecimal = false
    if (equation.length > 1) {
      isDecimal = equation[equation.length - 1] == "."
    }
    if (!isTime && currentNum.length > 2 && !isDecimal) {
      altered = formatNum(newNumber, (numUnaltered + 1).toString().length)
    } else {
      altered = newNumber
    }
    
    if (isAnswer) {
      let eqAns = equation
      eqAns.push(currentNum)
      setPrevAnswer(eqAns)
      setNum(addedNumber)
      setEquation([])
      setIsAnswer(false)
    } else if (isTime && newNumber.length == 3) {
      let numSplit = newNumber.match(/.{1,2}/g)
      let eq = equation
      eq.push(numSplit[0])
      eq.push(":")
      setEquation(eq)
      setNum(numSplit[1])
      setCurrentNum(numSplit[1])
      return;
    } else {
      setNum(newNumber)
    }
    setCurrentNum(altered)
  }

  const historyPressed = () => {
    if (currentNum == "") {
      let eq = [...equation]
      let ans = [...prevAnswer]
      console.log(ans)
      let num = ans.pop()
      eq.push(...ans)
      setCurrentNum(num)
      setNum(num)
      console.log(eq)
      setEquation(eq)
    }
  }

  const scrollViewRef = useRef();

  return (
    <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
        horizontal={true} 
        style={styles.numbersEntered}>
          <Text style={styles.typedText}>
            <Text style={styles.typedNumberText}>
              {equation}
            </Text>
            <Text style={styles.typedNumberText}>
              {currentNum}
            </Text>
          </Text>
      </ScrollView>
      <View>
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity style={styles.timeBtn} onPress={() => historyPressed()}>
            <Icon name="history" size={30} color="#86AD86" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.backBtn} onPress={() => backSpacePressed()}>
            <Icon name="backward" size={30} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View>
          <View style={styles.horizLine}/>
        </View>
        <View>
        <View style={styles.circleRow}>
            <TouchableOpacity style={styles.circle} onPress={() => clearPressed()}>
              <Text style={styles.textDark}>C</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.circle} onPress={() => parenthesisPressed()}>
              <Text style={styles.textLight}>()</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.circle} onPress={() => posNegPressed()}>
              <Text style={styles.textLight}>+/-</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.circle} onPress={() => pushSymbol("÷")}>
              <Text style={styles.textLight}>÷</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.circleRow}>
            <NumberBtn num={"1"}/>
            <NumberBtn num={"2"}/>
            <NumberBtn num={"3"}/>
            <TouchableOpacity style={styles.circle} onPress={() => pushSymbol("×")}>
              <Text style={styles.textLight}>×</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.circleRow}>
            <NumberBtn num={"4"}/>
            <NumberBtn num={"5"}/>
            <NumberBtn num={"6"}/>
            <TouchableOpacity style={styles.circle} onPress={() => pushSymbol("-")}>
              <Text style={styles.textLight}>-</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.circleRow}>
            <NumberBtn num={"7"}/>
            <NumberBtn num={"8"}/>
            <NumberBtn num={"9"}/>
            <TouchableOpacity style={styles.circle} onPress={() => pushSymbol("+")}>
              <Text style={styles.textLight}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.circleRow}>
            <TouchableOpacity style={styles.circle} onPress={() => {setIsTime(true); pushSymbol(":")}}>
              <Text style={styles.text}>:</Text>
            </TouchableOpacity>
            <NumberBtn num={"0"}/>
            <TouchableOpacity style={styles.circle} onPress={() => pushSymbol(".")}>
              <Text style={styles.text}>.</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.circleDark} onPress={() => equalsPressed()}>
              <Text style={styles.text}>=</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  numbersEntered: {
    alignSelf: 'flex-end',
    marginTop: 75,
    marginEnd: 30,
  },
  circleRow: {
    flexDirection: 'row',
    marginVertical: 7,
  },
  circle: {
    height: 85,
    width: 85,
    backgroundColor: '#5C765C50',
    borderRadius: 50,
    marginHorizontal: 7,
  },
  circleDark: {
    height: 85,
    width: 85,
    backgroundColor: '#86AD8695',
    borderRadius: 50,
    marginHorizontal: 7,
  },
  text: {
    textAlign: 'center',
    textAlignVertical: 'center',
    height: 85,
    width: 85,
    fontSize: 30,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  typedText: {
    textAlign: 'right',
    textAlignVertical: 'center',
    height: 85,
    fontSize: 40,
  },
  typedNumberText: {
    color: '#FFFFFF',
  },
  typedSymbolText: {
    color: '#86AD86',
  },
  textBtn: {
    textAlign: 'center',
    textAlignVertical: 'center',
    height: 40,
    width: 40,
    fontSize: 10,
    color: '#FFFFFF',
    backgroundColor: '#ffffff',
    fontWeight: 'bold'
  },
  textLight: {
    textAlign: 'center',
    textAlignVertical: 'center',
    height: 85,
    width: 85,
    fontSize: 30,
    color: '#86AD86',
    fontWeight: 'bold'
  },
  textDark: {
    textAlign: 'center',
    textAlignVertical: 'center',
    height: 85,
    width: 85,
    fontSize: 30,
    color: '#88DB88',
    fontWeight: 'bold'
  },
  horizLine: {
    width: 390,
    paddingHorizontal: 100,
    marginBottom: 30,
    borderBottomColor: '#5C765C50',
    borderBottomWidth: 2,
  },
  backBtn: {
    height: 40,
    width: 40,
    marginEnd: 30,
    marginBottom: 20,
  },
  timeBtn: {
    flex: 1,
    height: 40,
    width: 40,
    marginStart: 30,
    marginBottom: 15,
  }
});
