#include <stdio.h>

int main()
{
    int num;
    int original;
    int digit;
    int reverse = 0;

    printf("Enter a number: ");
    scanf("%d", &num);

    original = num;

    while (num != 0)
    {
        digit = num % 10;
        reverse = reverse * 10 + digit;
        num = num / 10;
    }

    if (original == reverse)
    {
        printf("Palindrome\n");
    }
    else
    {
        printf("Not Palindrome\n");
    }

    return 0;
}