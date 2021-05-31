
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
}
