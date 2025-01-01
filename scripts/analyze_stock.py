import argparse
import json
from phi.agent import Agent
from phi.model.groq import Groq
from dotenv import load_dotenv
from phi.tools.yfinance import YFinanceTools

# Load environment variables
load_dotenv()

def get_stock_analysis(tickers):
    if not tickers:
        return {"error": "No tickers provided."}

    # Format the input tickers for the prompt
    tickers_str = ", ".join(tickers)

    # Create and use the agent
    my_agent = Agent(
        model=Groq(id="llama-3.3-70b-versatile"),
        tools=[YFinanceTools(stock_price=True, analyst_recommendations=True, stock_fundamentals=True)],
        show_tool_calls=True,
        markdown=False,
        description="You are an investment analyst that researches stock prices, analyst recommendations, and stock fundamentals.",
        instructions=["return data in json format."]
    )

    # Dynamically set the query
    query = f"Summarize and compare analyst recommendations and fundamentals for {tickers_str}."
    
    # Get the agent's response
    response = my_agent.run(query)

    # Check if the response has a method to convert to a dictionary
    if hasattr(response, "to_dict"):
        return response.to_dict()
    
    # Manually extract serializable data if necessary
    if isinstance(response, dict):
        return response  # Already a dictionary
    
    # Fallback: Convert to a string representation
    return str(response)

if __name__ == "__main__":
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description="Analyze stock tickers using the phi agent.")
    parser.add_argument("--tickers", type=str, help="Comma-separated stock tickers (e.g., AAPL,MSFT,GOOGL).")

    args = parser.parse_args()
    
    # Process tickers
    tickers = args.tickers.split(",") if args.tickers else []
    
    # Perform analysis
    result = get_stock_analysis(tickers)

    # Output result as JSON
    print(json.dumps(result, indent=4))
