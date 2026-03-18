let a = 23;
let b = 46;
console.log(a*b);

function twoSum(nums, target){
    let map = new Map();
    for(let i = 0; i<=nums.length; i++){
        const complement = target - nums[i];
        if(map.has(complement )){
            return[map.get(complement ), i]
        }
        map.set(nums[i ],i )
    }
}
console.log(twoSum([3,7,11,15,2], 9   ))

const reverse = str => str.split('').reverse( ).join('');
console.log(reverse('hello'))

function reverseString (str){
    let reverse = ''
    for(let i = str.length -1; i>=0; i--){
        reverse += str[i ]
    }
    return reverse
}
console.log(reverseString('world'))

const number = num => num.toString().split('').reverse().join('');
console.log(number(12345));

const largestNumber = arr => Math.max(...arr)
console.log(largestNumber([3, 7, 11, 15, 2]))

function fizzBuzz(n){
    for(let i = 1; i<=n; i++){
        if(i % 3 === 0 && i % 5 === 0 ){
             console.log("fizzbuzz")
                
        }
        else if(i % 3 === 0){
             console.log("fizz" )
        }
        
        else if(i % 5 === 0){
            console.log("buzz" )
        }
        else{
            console.log(i)
        }
    }
}


fizzBuzz(20);

const plaindrome = str => str 

