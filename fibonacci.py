def fibonacci(n):
    seq = [0, 1]
    for i in range(2, n):
        seq.append(seq[-1] + seq[-2])
    return seq[:n]

numbers = fibonacci(20)

with open("fibonacci.txt", "w") as f:
    for i, num in enumerate(numbers):
        f.write(f"F({i}) = {num}\n")

print("First 20 Fibonacci numbers saved to fibonacci.txt")
print(numbers)
