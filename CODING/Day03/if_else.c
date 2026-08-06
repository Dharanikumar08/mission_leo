#include <stdio.h>
int main()
{
    int marks;
    printf("Enter your marks:   ");
    scanf("%d",&marks);
    if(marks >= 35)
    {
        printf("Congratulations you are passed.\n");
    }
    else
    {
        printf("Sorry you failed.\n");
    }
    return 0;
}    