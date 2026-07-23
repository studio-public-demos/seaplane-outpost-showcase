import time
import random
from sorting import bubble_sort, merge_sort, quick_sort

def run_benchmarks():
    # Use smaller sizes for Bubble Sort due to O(n^2) complexity
    sizes = [100, 500, 1000]
    
    print("Performance Comparison (in seconds):")
    for size in sizes:
        print(f"\n--- Array Size: {size} ---")
        arr = [random.randint(0, 10000) for _ in range(size)]

        # Bubble Sort
        start = time.perf_counter()
        bubble_sort(arr)
        print(f"Bubble Sort: {time.perf_counter() - start:.4f}s")

        # Merge Sort
        start = time.perf_counter()
        merge_sort(arr)
        print(f"Merge Sort: {time.perf_counter() - start:.4f}s")

        # Quick Sort
        start = time.perf_counter()
        quick_sort(arr)
        print(f"Quick Sort: {time.perf_counter() - start:.4f}s")

if __name__ == "__main__":
    run_benchmarks()
