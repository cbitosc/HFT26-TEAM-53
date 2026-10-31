
from parser import index_repository
from search import search_functions


def main():
    print("=" * 45)
    print("   CODE REPOSITORY SEARCH ENGINE")
    print("=" * 45)

    while True:
        print("\n1. Index repository (Tree-sitter)")
        print("2. Search code (BM25)")
        print("3. Exit")

        choice = input("\nEnter your choice: ")

        if choice == "1":
            index_repository()

        elif choice == "2":
            query = input("Enter search keyword: ")
            search_functions(query)

        elif choice == "3":
            print("Exiting search engine. Goodbye!")
            break

        else:
            print("Invalid choice. Try again.")


if __name__ == "__main__":
    main()
