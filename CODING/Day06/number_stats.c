#include <stdio.h>

int main()
{
    int num;
    int positive = 0;
    int negative = 0;
    int zero = 0;
    int sum = 0;

    for (int i = 1; i <= 10; i++)
    {
        printf("Enter number %d: ", i);
        scanf("%d", &num);

        if (num > 0)
        {
            positive++;
        }
        else if (num < 0)
        {
            negative++;
        }
        else
        {
            zero++;
        }

        sum = sum + num;
    }

    printf("\n----RESULT----\n");
    printf("Positive: %d\n", positive);
    printf("Negative: %d\n", negative);
    printf("Zero: %d\n", zero);
    printf("Sum: %d\n", sum);

    return 0;
}