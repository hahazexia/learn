
public class App {
    /*
    
    0 1 1 2 3 5 8 13 ....
    
    */
    public static int fib1(int n) {
        if (n <= 1) return n;
        return fib1(n - 1) + fib1(n - 2);
    }

    public static int fib2(int n) {
        if (n <= 1) return n;

        int first = 0;
        int second = 1;
        for (int i = 0; i < n - 1; i++) {
            int sum = first + second;
            first = second;
            second = sum;
        }
        return second;
    }

    public static void main(String[] args) throws Exception {
        System.out.println(Integer.MAX_VALUE);
        System.out.println(fib2(75));

        // TimeTool.check("fib1", new Task() {
        //     public void execute() {
        //         System.out.println(fib1(n));
        //     }
        // });

        // TimeTool.check("fib2", new Task() {
        //     public void execute() {
        //         System.out.println(fib2(n));
        //     }
        // });
    }

    public static void test1(int n) {
        // 1 + 1 + 4 + 4 + 4 
        // 14
        // O(1)
        if (n > 10) { 
            System.out.println("n > 10");
        } else if (n > 5) {
            System.out.println("n > 5");
        } else {
            System.out.println("n <= 5"); 
        }
        
        for (int i = 0; i < 4; i++) {
            System.out.println("test");
        }
    }

    public static void test2(int n) {
        // 1 + n + n + n
        // 1 + 3n
        // O(n)
        for (int i = 0; i < n; i++) {
            System.out.println("test");
        }
    }

    public static void test3(int n) {
        // 1 + 2n + n * (1 + 3n)
        // 1 + 3n + 3n^2
        // O(n^2)
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                System.out.println("test");
            }
        }
    }

    public static void test4(int n) {
        // 1 + 2n + n * (1 + 15 * 3)
        // 1 + 48n
        // O(n)
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < 15; j++) {
                System.out.println("test");
            }
        }
    }

    public static void test5(int n) {
        // log2(n)
        // O(logn)
        while ((n = n / 2) > 0) {
            System.out.println("test");
        }
    }

    public static void test6(int n) {
        // log5(n)
        // O(logn)
        while ((n = n / 5) > 0) {
            System.out.println("test");
        }
    }

    public static void test7(int n) {
        // 1 + 2log2(n) + log2(n) * (1 + 3n)
        // 1 + 3log2(n) + 3nlog2(n)
        // O(nlogn)
        for (int i = 1; i < n; i = i * 2) {
            for (int j = 0; j < n; j++) {
                System.out.println("test");
            }
        }
    }

    public static void test10(int n) {
        int a = 10;
        int b = 20;
        int c = a + b;
        int[] array = new int[n];
        for (int i = 0; i < array.length; i++) {
            System.out.println(array[i] + c);
        }
    }
}
