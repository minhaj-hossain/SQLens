# Module 01: Python for JS Devs (Syntax Translation)

## [CONCEPT 1] Variables & Name Binding
**The JS Way:**
```javascript
const name = "Minhaj";
let age = 25;
```

**The Python Way:**
```python
name = "Minhaj"
age = 25
```

**Theory:** 
Python doesn't have `const` or `let` in the JavaScript sense. In Python, variables are simply "names bound to objects". There is no keyword required to declare a variable. 

---

## [TASK 1] First Variables & Print
**Instructions:** 
1. Create a variable called `status` and set it to the string `"learning"`.
2. Print the variable using `print()`. (In Python, `print()` is the equivalent of `console.log()`).

**Initial Code:**
```python
# Write your code here

```

**Hidden Test Code:**
```python
assert 'status' in globals(), "You need to define a variable named 'status'."
assert status == "learning", "The status should be exactly 'learning'."
```

---

## [CONCEPT 2] Null vs Undefined vs None
**The JS Way:**
```javascript
let missingValue = null;
let unsetObject; // undefined
```

**The Python Way:**
```python
missing_value = None
```

**Theory:** 
JavaScript has two ways to represent nothing: `null` and `undefined`. Python only has one: `None`. If a function doesn't return anything in Python, it returns `None`.

---

## [TASK 2] Predicting None
**Instructions:** 
Create a variable called `user_score` and set it to `None`. Note that `None` must be capitalized in Python!

**Initial Code:**
```python

```

**Hidden Test Code:**
```python
assert 'user_score' in globals(), "You need to define a variable named 'user_score'."
assert user_score is None, "user_score must be explicitly set to None."
```

---

## [CONCEPT 3] Truthiness
**The JS Way:**
```javascript
if ([]) {
  console.log("Empty arrays are truthy in JS!");
}
```

**The Python Way:**
```python
if []:
    print("This will never run.")
else:
    print("Empty lists are falsy in Python!")
```

**Theory:** 
This is a massive gotcha for JavaScript developers. In JS, empty arrays `[]` and empty objects `{}` are **truthy**. In Python, empty lists `[]` and empty dictionaries `{}` are **falsy**. 

---

## [TASK 3] The Truthiness Trap (Deliberate Bug)
**Instructions:** 
The code below checks if a user has any permissions. Because the list is empty, it *should* evaluate to false and print "Access Denied". 

However, a JavaScript developer wrote this code and explicitly checked `is not None` (the equivalent of `!== null`). Run the code and see how it incorrectly grants access!

**Your Goal:** Fix the `if` statement so it relies entirely on Python's native falsy evaluation of empty lists.

**Initial Code:**
```python
permissions = []

# This code incorrectly prints "Access Granted" because an empty list is not None.
# Fix the if-statement so it relies entirely on Python's falsy evaluation of empty lists.
if permissions is not None:
    print("Access Granted")
else:
    print("Access Denied")
```

**Hidden Test Code:**
```python
assert "is not None" not in user_code_str, "Don't check for None. Simply evaluate the list directly: 'if permissions:'"
assert "len(" not in user_code_str, "Don't use len(). Empty lists evaluate to False natively."
assert "if permissions:" in user_code_str.replace(" ", ""), "You should write 'if permissions:' to use Python's truthiness."
```
