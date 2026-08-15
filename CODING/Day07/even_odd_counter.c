#include <stdio.h>

int main()
{
    int num;
    int even = 0;
    int odd = 0;

    for (int i = 1; i <= 10; i++)
    {
        printf("Enter number %d: ", i);
        scanf("%d", &num);

        if (num % 2 == 0)
        {
            even++;
        }
        else
        {
            odd++;
        }
    }

    printf("\n--- RESULT ---\n");
    printf("Even: %d\n", even);
    printf("Odd: %d\n", odd);

    return 0;
}