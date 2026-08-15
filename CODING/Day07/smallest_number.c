#include <stdio.h>

int main()
{
    int num;
    int smallest;

    printf("Enter number 1: ");
    scanf("%d", &smallest);

    for (int i = 2; i <= 10; i++)
    {
        printf("Enter number %d: ", i);
        scanf("%d", &num);

        if (num < smallest)
        {
            smallest = num;
        }
    }

    printf("\nSmallest number: %d\n", smallest);

    return 0;
}