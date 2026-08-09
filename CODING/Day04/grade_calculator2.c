#include <stdio.h>
int main()
{
    int marks;
    printf("Enter your marks: ");
    scanf("%d",&marks);

    if(marks < 0 || marks > 100)
    {
        printf("Invalid marks\n");
    }

    else if (marks >= 90)
    {
        printf("GRADE: A\n");
    }
    else if (marks >= 80)
    {
        printf("GRADE: B\n");
    }
     else if (marks >= 70)
    {
        printf("GRADE: C\n");
    }
     else if (marks >= 60)
    {
        printf("GRADE: D\n");
    }
     else 
    {
        printf("Fail\n");
    }
    
    return 0;
}