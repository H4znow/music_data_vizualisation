# Project: Evolution of Music Genres  Visualization

## Overview

This project presents a hierarchical visualization of music genres using an interactive **circle packing visualization**. The visualization enables users to explore super-genres and their subgenres through three main interactive features: size-based filtering, search functionality, and zoom interactions. The implementation provides an intuitive way to understand the structure and relative sizes of different music genres..

---

## Visualization and Its Purpose

### Interactive Circle Packing - Music Genre Hierarchy Visualization

- **Purpose**: The circle packing visualization displays the hierarchical structure of music genres, showing how subgenres nest within their super-genres. The visualization helps users understand genre categorization and explore specific genres of interest through search and filtering capabilities.
  
- **Key Features**:
  - **Search Functionality**: Quick location and zoom to specific genres.
  - **Size-based Filtering**: Filter genres by size categories (large/medium/small/Tiny)
  - **Interactive Hover**: Information display for genres on mouse hover.
  - **Zoom Interaction**: Automatic zoom to focus on selected genres.
  - **Color Coding**: Different colors for each super-genre and lighter shades for subgenres.

- **Why This Visualization?**: This visualization method was chosen because it:
- Effectively shows the hierarchy between genres and subgenres
- Represents size relationships through circle areas
- Provides a clear and organized view of the genre structure
- Supports the implemented interactive features effectively

---

## Implementation Details

The visualization was built using D3.js with three main interactive components:
- **Size-based Filtering**:
   - Implementation of size categories (large/medium/small)
   - Visual feedback through opacity changes
   - Easy reset to normal view
   - Smooth transitions between states
- **Search System**: 
   - Real-time search functionality
   - Results updating as user types
   - Automatic zoom to selected genres
   - Clear visual feedback for search results
- **Interactive Elements**: 
   - Hover information display
   - Zoom functionality for selected genres
   - Color-coded genre categories
   - Smooth transitions for all interactions

---

## Future Directions

Potential enhancements for this visualization could include:

- Adding genre relationship visualization
- Implementing timeline data for genre evolution
- Including audio samples for different genres
- Adding detailed genre statistics
- Incorporating artist information
- Adding data export capabilities

---

## Conclusion

The combination of search functionality, size filtering, and zoom interactions creates an effective tool for exploring and understanding music genre hierarchies. The implementation demonstrates the power of interactive visualization techniques in making complex hierarchical data accessible and explorable.

----

# Project Contributions

In this project, Yu contributed to data processing, server setup, project architecture, and documentation. Here’s a detailed breakdown of Yu's work:

---

## 1. Data Processing Scripts
   - **Scripts**:
     - `_get_genre_super_genre_structure.js`: Process the mapping between genres and super-genres, and transform raw genre data into a hierarchical **parent-child structure** needed to create a cycle packing.

## 2. Visualization Implementation
   - **Scripts**:
     - `visualization4.html`: Developed the webpage structure for the visualization and set up the SVG container for the circle packing.

## 3. Interactive Visualization 
   - **Scripts**:
     - `visualization4.js`: Implemented core visualization features using D3.js and added interactive features including **Search Functionality**, **Size-based Filtering**, **Hover and Click Interactions**.
