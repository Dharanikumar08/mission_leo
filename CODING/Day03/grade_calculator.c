#include <stdio.h>
int main()
{
    int marks;

    printf("Enter your marks:   ");
    scanf("%d",&marks);

      if (marks >= 90)
    {
        printf("Grade A - Excellent!\n");
    }
    else if (marks >= 75)
    {
        printf("Grade B - Very Good!\n");
    }
    else if (marks >= 60)
    {
        printf("Grade C - Good!\n");
    }
    else if (marks >= 35)
    {
        printf("Grade D - Pass!\n");
    }
    else
    {
        printf("Fail. Better luck next time!\n");
    }

    return 0;
}

