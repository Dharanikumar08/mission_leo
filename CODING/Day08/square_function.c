#include <stdio.h>
int square(int num)
{
    return num * num;
}
int main()
{
    int num;
    int result;

    printf("Enter a number: ");
    scanf("%d",&num);

    result = square(num);

    printf("Square: %d\n", result);

    return 0;
}