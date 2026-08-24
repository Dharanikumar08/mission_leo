#include <stdio.h>

int total(int a, int b, int c, int d, int e)
{
    return a + b + c + d + e;
}

float average(int total_marks)
{
    return total_marks / 5.0;
}

int highest(int a, int b, int c, int d, int e)
{
    int high = a;

    if (b > high)
        high = b;

    if (c > high)
        high = c;

    if (d > high)
        high = d;

    if (e > high)
        high = e;

    return high;
}

int lowest(int a, int b, int c, int d, int e)
{
    int low = a;

    if (b < low)
        low = b;

    if (c < low)
        low = c;

    if (d < low)
        low = d;

    if (e < low)
        low = e;

    return low;
}

int main()
{
    int math;
    int physics;
    int chemistry;
    int english;
    int computer;

    int total_marks;
    float avg;
    int high;
    int low;

    printf("Enter Math marks: ");
    scanf("%d", &math);

    printf("Enter Physics marks: ");
    scanf("%d", &physics);

    printf("Enter Chemistry marks: ");
    scanf("%d", &chemistry);

    printf("Enter English marks: ");
    scanf("%d", &english);

    printf("Enter Computer Science marks: ");
    scanf("%d", &computer);

    total_marks = total(math, physics, chemistry, english, computer);

    avg = average(total_marks);

    high = highest(math, physics, chemistry, english, computer);

    low = lowest(math, physics, chemistry, english, computer);

    printf("\n----- STUDENT RESULT -----\n");

    printf("Total: %d\n", total_marks);
    printf("Average: %.2f\n", avg);
    printf("Highest: %d\n", high);
    printf("Lowest: %d\n", low);

    if (avg >= 40)
    {
        printf("Status: PASS\n");
    }
    else
    {
        printf("Status: FAIL\n");
    }

    return 0;
}