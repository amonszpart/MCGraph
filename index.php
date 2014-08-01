<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN">
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Force based label placement</title>
    <script type="text/javascript" src="http://mbostock.github.com/d3/d3.js?2.6.0"></script>
    <!--  <script type="text/javascript" src="https://code.jquery.com/jquery-2.1.1.min.js"></script> -->
    <!-- <script type="text/javascript" src="http://mbostock.github.com/d3/d3.layout.js?2.6.0"></script>
    <script type="text/javascript" src="http://mbostock.github.com/d3/d3.geom.js?2.6.0"></script> -->
    <link href="style.css" rel="stylesheet" type="text/css">
  </head>
  <body>
    <!-- Parse "graph" argument -->
        <?php 
        if ( isset($_GET["graph"]) )
          $json_path = "data/" . $_GET["graph"];
        else
          $json_path = "data/fig1.json"; 
          
        if ( isset($_GET["abstraction"]) )
          $abstraction_path = "data/" . $_GET["abstraction"];
        else
          $abstraction_path = "data/fig1_abstraction.json";
    ?>

    <!-- Feedback graph json file used -->
    <?php echo "Used graph json file (usage: .../index.php?graph=graph.json&abstraction=abstraction.json): <b>" . $json_path . "</b> and <b>" . $abstraction_path . "</b>, source location: <i>/home/amonszpa/www/public_html/MCGraph</i> <br>"; ?>

    <!-- Create javascript variable for json_path -->
    <script type="text/javascript" charset="utf-8">
      var json_path = "<?php echo $json_path; ?>";
      var abstraction_path = "<?php echo $abstraction_path; ?>";
    </script>

    <!-- Launch graph code (using json_path javascript variable as input) -->
    <script type="text/javascript" charset="utf-8" src="graph.js"></script>

  </body>
</html>
