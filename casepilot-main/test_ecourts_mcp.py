"""Test eCourts MCP connection using Streamable HTTP (correct type)."""

import asyncio
import os
from dotenv import load_dotenv
from google.adk.tools.mcp_tool import McpToolset, StreamableHTTPConnectionParams

load_dotenv()
ECOURTS_API_KEY = os.getenv("ECOURTS_API_KEY", "")

async def test_mcp():
    if not ECOURTS_API_KEY or ECOURTS_API_KEY == "YOUR_API_KEY_HERE":
        print("ERROR: ECOURTS_API_KEY not found in .env")
        return

    mcp_url = f"https://mcp.ecourtsindia.com/mcp?token={ECOURTS_API_KEY}"
    print(f"Connecting to MCP (HTTP) at: {mcp_url}...")

    try:
        # Create the toolset with Streamable HTTP (type: "http")
        toolset = McpToolset(
            connection_params=StreamableHTTPConnectionParams(url=mcp_url)
        )

        # Fetch tools from the MCP server
        print("Fetching tools from MCP server...")
        tools = await toolset.get_tools()

        print(f"\n{'='*60}")
        print(f"SUCCESS! Connected to eCourts MCP!")
        print(f"Found {len(tools)} tools available.")
        print(f"{'='*60}\n")

        print("All available tools:")
        for i, tool in enumerate(tools, 1):
            print(f"  {i:2d}. {tool.name}")

        # Clean up
        await toolset.close()
        print("\nConnection closed successfully.")

    except Exception as e:
        print(f"\nERROR: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_mcp())
