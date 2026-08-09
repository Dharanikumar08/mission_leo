#include <stdio.h>
int main()
{
    int age;
    printf("Enter your age: ");
    scanf("%d",&age);

    if (age < 0 || age > 18 )
    {
        printf("Invalid age");
    }
    else if (age >= 18)
    {
        printf("Eligible to vote");
    }
    else if (age <= 18)
    {
        printf("Not eligible to vote");
    }
    

}