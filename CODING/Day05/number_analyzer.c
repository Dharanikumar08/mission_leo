#include <stdio.h>
int main()
{
    int num;
    int positive = 0;
    int negative = 0;
    int zero = 0;
    for (int i = 0; i <= 5; i++)
    {
        printf("Enter number %d: ", i);
        scanf("%d",&num);

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
    }

    printf("\n----RESULT----\n");
    printf("Positive: %d\n", positive);
    printf("Negative: %d\n", negative);
    printf("Zero: %d\n", zero);
}