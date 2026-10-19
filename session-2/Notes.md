
- Install the venv




python3 -m venv myenv

 source myenv/bin/activate
 pip install fastapi uvicorn




------

1. main.py

- ans = sum(2, 4)
print(ans)

------
2. sum.py
- function, which calculate the sum()

sum(a, b):
    return a + b



=====

API's => 100

- 100 validation class - method
- models
- services

-----

- /book - get all, details, delete
- /user - get all, details, delete




=====


routes -> list of all the routes
controller -> recieve the res and return the res
service -> business logic
dao -> database 
models -> models
data -> static data




 data = {
        "id": 2,
        "title": "Atomic Habits",
        "author": "James Clear",
        "category": "Self Help",
        "available": False
}
 data2 = {
       "price": 100,
}


{daa, ...data}

ans = (data, **data2)

{
        "id": 2,
        "title": "Atomic Habits",
        "author": "James Clear",
        "category": "Self Help",
        "available": False,
        "price": 100,
}