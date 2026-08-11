#include <stdio.h>

int main()
{
    int num;

    do
    {
        printf("Enter number: ");
        scanf("%d", &num);

        if (num == 10)
        {
            printf("Correct!\n");
        }
        else
        {
            printf("Try again.\n");
        }

    } while (num != 10);

    return 0;
}