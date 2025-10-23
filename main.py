from PIL import Image

def get_unique_color_values(image_path):
    """
    Loads an image, extracts the RGB color value of every pixel, and
    returns a set of only the unique color tuples.

    Args:
        image_path (str): The file path to the image.

    Returns:
        set: A set of unique (R, G, B) tuples, where each tuple represents
             a unique color in the image.
             Returns None if the file cannot be opened or is not a
             valid image.
    """
    try:
        # Open the image
        img = Image.open(image_path)

        # Convert to RGB to standardize the color tuples
        img = img.convert("RGB")

        # *** Key Change: Use set() to get only unique color values ***
        # img.getdata() returns a sequence of all colors.
        # Passing it to set() automatically filters out duplicates.
        unique_colors = set(img.getdata())

        return unique_colors

    except FileNotFoundError:
        print(f"Error: Image file not found at {image_path}")
        return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

# --- Example Usage ---

# 1. Installation Note (if needed):
# pip install Pillow

# 2. Set the path to your image
# NOTE: Replace 'your_image.jpg' with the actual path to your image file.
image_file = 'public/cat.png'

# Get the unique color data
unique_colors = get_unique_color_values(image_file)

if unique_colors is not None:
    print(f"Total number of pixels in the image (if loaded): {len(Image.open(image_file).convert('RGB').getdata())}")
    print(f"Successfully extracted **{len(unique_colors)} unique** color values.")

    # Print a sample of the unique colors
    print("\nSample of the unique color values (RGB):")
    # Convert to a list to iterate and slice, as sets are unordered
    unique_color_list = list(unique_colors)
    for color in unique_color_list[:10]:
        print(f"{color}")