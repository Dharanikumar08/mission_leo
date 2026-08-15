#include <stdio.h>

int main()
{
    int num;
    int sum = 0;
    float average;

    for (int i = 1; i <= 10; i++)
    {
        printf("Enter number %d: ", i);
        scanf("%d", &num);

        sum = sum + num;
    }

    average = sum / 10.0;

    printf("\n----- RESULT -----\n");
    printf("Sum: %d\n", sum);
    printf("Average: %.2f\n", average);

    return 0;
}
