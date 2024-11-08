# Project: Evolution of Music Genres  Visualization

## Overview

This project focuses on the evolution of music genres over time using a single **animated bar chart**. The visualization allows users to observe changes in the production volume for various genres and shifts in artist popularity. With key filtering options, users can customize their view to explore specific genres, adjust the animation start year, and decide whether to include data with unknown release years.

---

## Visualization and Its Purpose

### Animated Bar Chart - Music Genre Production and Artist Popularity Over Time

- **Purpose**: The animated bar chart illustrates the evolution of music genre production across time, as well as the shifting popularity of artists within these genres. By visualizing these patterns dynamically, it highlights which genres are experiencing growth and which may be in decline. This insight is crucial for record labels, producers, and other stakeholders, enabling them to adjust their focus to align with current trends.
  
- **Key Features**:
  - **Year Filter**: Select a starting year to see genre trends and artist popularity beginning from a specific point in time.
  - **Genre Selection**: Focus on a single genre or compare multiple genres to see how each has evolved.
  - **Include Unknown Data**: Toggle to display or hide records with unknown release years, which can provide a fuller or more curated view of the data.

- **Why This Visualization?**: An animated bar chart is an effective choice for capturing changes over time. It visually illustrates shifts in genre production and artist popularity with ease and intuitiveness, making it accessible to users of all backgrounds. The dynamic nature of the animation enhances the storytelling element, while the filters add control, allowing users to tailor the data to their specific interests.

---

## Data Processing Steps

To prepare the data for this animated visualization, we went through several processing steps, each with a dedicated script:

1. **1_fetch_song_with_basic_processing.js**  (1 hour)
   - **Function**: Retrieved 100,000 songs from the Wasabi project, capturing basic information such as genre and release date.
   - **Purpose**: Established a diverse dataset covering a broad spectrum of genres, which is essential for accurate genre analysis.

2. **2_create_super_genres.js**  
   - **Function**: Grouped genres into broader "super genres" to simplify visualization.
   - **Purpose**: Enables analysis of high-level genre trends rather than getting lost in the nuances of sub-genres.

3. **3_fetch_songs_by_super_genres.js**  
   - **Function**: Organized the songs by their super genres for focused analysis.
   - **Purpose**: Ensures the visualization can clearly show each genre’s production patterns.

4. **4_processing_songs.js**  (9 hours)
   - **Function**: For songs with unknown release dates, retrieved album release years to fill gaps.
   - **Purpose**: Ensures each song entry has a meaningful release year, enhancing the chronological accuracy of the animation.

5. **5_count_super_genre_by_year.js**  
   - **Function**: Created a final JSON file containing the number of songs released for each genre by year.
   - **Purpose**: This processed data is directly used in the animated bar chart to display genre and artist popularity trends over time.

---

## Why an Animated Bar Chart?

The animated bar chart is particularly effective for this project because:
- **Trend Clarity**: It makes it easy to spot patterns, such as growth and decline in genres, at a glance.
- **Intuitive Engagement**: The dynamic progression of the animation draws viewers in, making it more engaging than static charts.
- **Customizable Exploration**: Filters empower users to interact with the data, tailoring it to their specific interests and exploring trends from various perspectives.

---

## Future Directions

Potential enhancements for this project could include:
- Adding **additional filters** (e.g., regional selection) to offer a more nuanced view of genre trends.
- **Interactive highlights** for specific artists or genres, allowing users to follow particular data points through the animation.
- Incorporating **predictive insights** based on historical data, potentially offering projections of future trends.

---

## Conclusion

The animated bar chart provides a powerful, engaging way to visualize trends in music genre production and artist popularity over time. With its intuitive design and flexible filters, it serves as a valuable tool for industry stakeholders to understand and respond to shifts in the music landscape.

----

# Project Contributions

In this project, I contributed to data processing, server setup, project architecture, and documentation. Here’s a detailed breakdown of my work:

---

## 1. Data Processing Scripts
   - Created **five scripts** in `scripts/histogramm_scripts/` to process and refine the data, ultimately producing a dataset with the yearly count of songs by genre. Each script serves a unique purpose in ensuring that the data is complete, accurate, and ready for visualization.
   
   - **Scripts**:
     - `1_fetch_song_with_basic_processing.js`: Fetched songs with essential fields and performed initial data processing.
     - `2_create_super_genres.js`: Grouped individual genres into broader super genres for simplified analysis.
     - `3_fetch_songs_by_super_genres.js`: Gathered all songs within each super genre to ensure comprehensive genre coverage.
     - `4_processing_songs.js`: Retrieved album release dates for songs with missing release years.
     - `5_count_super_genre_by_year.js`: Generated the final JSON dataset, counting the songs released each year for each genre.

## 2. Song Data Fetching Script
   - Developed `fetchWasabi.js` to extract song data from the Wasabi dataset, focusing on a few key fields (e.g., genre and release year) required for our analysis. This initial extraction laid the foundation for efficient and relevant data processing in later stages.

## 3. Flask Server Setup
   - Set up the **Flask server** to run and manage the visualization. This server structure ensures the visualization is easily accessible and can serve data efficiently, allowing for seamless interaction with the animated bar chart.

## 4. Project Architecture
   - Designed and implemented the **architecture of the project**, organizing scripts, data, and server components into a coherent structure. This architecture supports scalability and facilitates maintenance, making the project adaptable to potential future modifications or additions.

## 5. Documentation: Histogram Section of the Report
   - Authored the **Histogram section of the report**, detailing the purpose, design choices, and data processing steps behind the animated bar chart visualization. This section explains how the histogram captures genre and popularity trends, along with the significance of the filtering options (e.g., year, genre, and unknown data inclusion).

---

# My Contributions

- **Data Processing Scripts**: Developed five scripts in `scripts/histogramm_scripts/` to process data and create the final dataset, which includes yearly counts of songs by genre.
- **Data Fetching**: Wrote `fetchWasabi.js` to pull song data (e.g., genre, release year) from the Wasabi dataset, providing the foundation for our analysis.
- **Flask Server Setup**: Set up the server to run the visualization, enabling easy data interaction through the animated bar chart.
- **Project Architecture**: Organized the project structure to support scalability and efficient data flow.
- **Histogram Report Section**: Documented the histogram part, explaining the purpose and design choices of the animated bar chart visualization.