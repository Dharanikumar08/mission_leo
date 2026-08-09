#include <stdio.h>
int main()
{
    int marks;

    printf("Enter your marks:   ");
    scanf("%d",&marks);

      if (marks >= 90-100)
    {
        printf("Grade A - Excellent!\n");
    }
    else if (marks >= 80-89)
    {
        printf("Grade B - Very Good!\n");
    }
    else if (marks >= 70-79)
    {
        printf("Grade C - Good!\n");
    }
    else if (marks >= 60-69)
    {
        printf("Grade D - Pass!\n");
    }
    else if (marks >= 60)
    {
        printf("Fail. Better luck next time!\n");
    }
    else if (marks < 100)
    {
        printf("INVALID");
    }

    return 0;
}

