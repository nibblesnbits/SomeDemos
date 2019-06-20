
/*
    So I feel like I'm seriously oversimplifying this, but
    as far as I can tell this is technically correct.
    Also, I'm sure there are much more elegant ways of doing this.
    
    I'd love to have the time to flesh it out enough to let you
    know where it expects closing parens, but my time is limited.
*/

// O(n)
function naiveValidate(input) {
    const arr = input.split('');
    let startCount = 0;
    let endCount = 0;
    for (let i = 0; i < arr.length; i++) {
        const first = arr[i];
        const last = arr[arr.length - i];
        
        if (first === "(") {
            startCount += 1;
        }
        if (last === ")") {
            endCount += 1;
        }
    }
    return startCount === endCount;
}

// O(n*2)
function functionalValidate(input) {
    const arr = input.split('');
    return arr.filter(a => a === "(").length
        === arr.filter(a => a === ")").length;
}

const valid = '((x)(xxx))';
const invalid = '((x(xxx))';

console.log(naiveValidate(valid));
console.log(functionalValidate(invalid));

console.log(naiveValidate(valid));
console.log(functionalValidate(invalid));