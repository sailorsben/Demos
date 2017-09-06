 var aspectRatioHeight = null;
 var aspectRatioWidth = null;
 var body = null;
 var centerPoint = null;
 var currentX = null;
 var currentY = null;
 var dragBehavior = null;
 var duplicate = null;
 var elementBounds = null;
 var elementPoint = null;
 var getView = null;
 var home = null;
 var inverseK = null;
 var minimap = null;
 var minimapBackground = null;
 var minimapBoundaries = null;
 var minimapDimensions = null;
 var minimapViewer = null;
 var minimapViewerDimensions = null;
 var mouseSVGPoint = null;
 var offSetX = null;
 var offSetY = null;
 var selectedElement = null;
 var selectedX = null;
 var selectedY = null;
 var svgSource = null;
 var translateHeightRatio = null;
 var translateK = null;
 var translateWidthRatio = null;
 var translateY = null;
 var translateZ = null;
 var toBeDuplicated = null;
 var viewerBoundaries = null;
 var viewerPoint = null;
 var viewerCoords = null;
 var viewportBoundaries = null;
 var viewportDimensions = null;
 var zoom = null;

 viewportDimensions = {
   height: 300,
   width: 500
 }

 aspectRatioHeight = 0.25;
 aspectRatioWidth = 0.25;

 minimapDimensions = {
   height: viewportDimensions.height * aspectRatioHeight,
   width: viewportDimensions.width * aspectRatioWidth
 };

 minimapViewerDimensions = {
   height: minimapDimensions.height,
   width: minimapDimensions.width
 }

 home = d3.select("svg#home")
   .attr("height", viewportDimensions.height + "px")
   .attr("width", viewportDimensions.width + "px")
   .attr("class", "shadow");

 gradient = home.append("defs")
   .append("linearGradient")
   .attr("id", "gradient")
   .attr("x1", "0%")
   .attr("y1", "0%")
   .attr("x2", "100%")
   .attr("y2", "100%")
   .attr("spreadMethod", "pad")

 gradient.append("stop")
   .attr("offset", "0%")
   .attr("stop-color", "navy")
   .attr("stop-opacity", 1);

 gradient.append("stop")
   .attr("offset", "100%")
   .attr("stop-color", "gray")
   .attr("stop-opacity", 1);

 mainViewPort = home.append("rect")
   .attr("id", "homeVP")
   .attr("height", viewportDimensions.height + "px")
   .attr("width", viewportDimensions.width + "px")
   .attr("fill", "url(#gradient)");

 toBeDuplicated = document.getElementById("clone");

 duplicate = toBeDuplicated.cloneNode(true);

 appendClone(duplicate);

 translateX = 0;
 translateY = 0;
 translateK = 1;

 inverseK = 1 / translateK;

 //Add a white viewbox onto the top of the minimap
 minimapViewer = minimap
   .append("rect")
   .attr("fill", "transparent")
   .attr("height", minimapViewerDimensions.height + "px")
   .attr("width", minimapViewerDimensions.width + "px")
   .attr("id", "minimapViewer");

 function appendClone(duplicate) {

   duplicate.id = "minimapClone";
   duplicate.width = "300px";
   duplicate.height = "300px";
   duplicate.childNodes[1].id = "minimap";
   duplicate.childNodes[1].childNodes[0].childNodes[0].id = "gradient_minimap";
   duplicate.childNodes[1].childNodes[1].id = "minimapBackground";

   body = document.getElementsByTagName("body")[0];

   body.insertBefore(duplicate, body.lastElementChild);

   minimap = d3.select("svg#minimap")
     .attr("height", minimapDimensions.height)
     .attr("width", minimapDimensions.width);

   minimapBackground = d3.select("rect#minimapBackground")
     .attr("height", minimapDimensions.height + "px")
     .attr("width", minimapDimensions.width + "px")
     .attr("fill", "url(#gradient_minimap)");
 }


 // Get the current position of the mouse cursor in x and y coordinates.
 function setCursorData(event) {
   currentX = event.clientX;
   currentY = event.clientY;
 }

 function setViewPortControlElements() {
   selectedElement = document.getElementById("homeVP");
   svgSource = document.getElementById("home");
 }

 function setMiniMapControlElements() {
   selectedElement = document.getElementById("minimapViewer");
   svgSource = document.getElementById("minimap");
 }

 // Checks the boundaries of the viewer and creates and array for easy access to the properties
 function checkBounds() {
   elementBounds = selectedElement.getBoundingClientRect();

   elementPoint = {
     left: elementBounds.left,
     right: elementBounds.right,
     top: elementBounds.top,
     bottom: elementBounds.bottom
   };
 }

 // Creates the offset that the viewport should be translated by to keep it under the cursor
 function setOffSet() {
   offSetX = currentX - elementPoint.left;
   offSetY = currentY - elementPoint.top;
 }

 // Converts regular coordiantes to coordinates inside of the SVG element for translations
 function cursorPointSVG(event) {
   viewerPoint = svgSource.createSVGPoint();
   viewerPoint.x = event.clientX;
   viewerPoint.y = event.clientY;

   return viewerPoint.matrixTransform(svgSource.getScreenCTM().inverse());
 }

 function adjustForScale(adjustedPoints) {
   adjustedPoints.x = adjustedPoints.x * aspectRatioWidth;
   adjustedPoints.y = adjustedPoints.y * aspectRatioHeight;

   return adjustedPoints;
 }

 function jumpToCursor() {
   setCursorData(d3.event.sourceEvent);
   setMiniMapControlElements();
   checkBounds();
   setOffSet();

   centerPoint = cursorPointSVG(d3.event.sourceEvent);
   offSetX = (minimapViewerDimensions.width * inverseK) / 2;
   offSetY = (minimapViewerDimensions.height * inverseK) / 2;
   selectedX = centerPoint.x - offSetX;
   selectedY = centerPoint.y - offSetY;

   // Top Boundary
   if (selectedY < 0) {
     selectedY = 0;
   }

   // Left Boundary
   if (selectedX < 0) {
     selectedX = 0;
   }

   // Right Boundary
   if (selectedX + (minimapViewerDimensions.width * inverseK) > minimapDimensions.width) {
     selectedX = minimapDimensions.width - (minimapViewerDimensions.width * inverseK);
   }

   // Bottom Boundary
   if (selectedY + (minimapViewerDimensions.height * inverseK) > minimapDimensions.height) {
     selectedY = minimapDimensions.height - (minimapViewerDimensions.height * inverseK);
   }

   translateX = -selectedX / translateWidthRatio;
   translateY = -selectedY / translateHeightRatio;

   minimapViewer.attr("transform", "translate(" + selectedX + "," + selectedY + ") scale(" + inverseK + ")");
   mainViewPort.attr("transform", "translate(" + translateX + "," + translateY + ") scale(" + translateK + ")");
   zoom.transform(home, d3.zoomIdentity.translate(translateX, translateY).scale(translateK));
 }

 // Controls the translation on the viewport
 function translation() {
   mouseSVGPoint = cursorPointSVG(d3.event.sourceEvent);
   // OffSets are to keep the mouse where it is on the movebox.

   selectedX = mouseSVGPoint.x - offSetX;
   selectedY = mouseSVGPoint.y - offSetY;

   // Top Boundary
   if (selectedY < 0) {
     selectedY = 0;
   }

   // Left Boundary
   if (selectedX < 0) {
     selectedX = 0;
   }

   // Right Boundary
   if (selectedX + (minimapViewerDimensions.width * inverseK) > minimapDimensions.width) {
     selectedX = minimapDimensions.width - (minimapViewerDimensions.width * inverseK);
   }

   // Bottom Boundary
   if (selectedY + (minimapViewerDimensions.height * inverseK) > minimapDimensions.height) {
     selectedY = minimapDimensions.height - (minimapViewerDimensions.height * inverseK);
   }

   translateX = -selectedX / translateWidthRatio;
   translateY = -selectedY / translateHeightRatio;

   minimapViewer.attr("transform", "translate(" + selectedX + "," + selectedY + ") scale(" + inverseK + ")");
   mainViewPort.attr("transform", "translate(" + translateX + "," + translateY + ") scale(" + translateK + ")");
   zoom.transform(home, d3.zoomIdentity.translate(translateX, translateY).scale(translateK));
 }

 // Initializes the process on click / dragStart
 function dragStart() {
   setCursorData(d3.event.sourceEvent);
   setMiniMapControlElements();
   checkBounds();
   setOffSet();
 }

 // Initialized translation processes
 function dragMove() {
   translation();
 }

 // Nothing needs to happen at the end here yet.
 function dragEnd() {
   document.getElementById("minimap").style.cursor = "default";
 }

 dragBehavior = d3.drag()
   .on("start", dragStart)
   .on("drag", dragMove)
   .on("end", dragEnd);

 minimapViewer.call(dragBehavior);

 clickAndDrag = d3.drag()
   .on("start", jumpToCursor)
   .on("drag", dragMove)
   .on("end", dragEnd);

 minimap.call(clickAndDrag);

 document.getElementById("home").addEventListener("mousemove", () => { /*empty*/ });

 function zoomed() {

   mainViewPort.attr("transform", d3.event.transform);

   translateX = d3.event.transform.x;
   translateY = d3.event.transform.y;
   translateK = d3.event.transform.k;
   inverseK = 1 / translateK;

   viewportBoundaries = document.getElementById("homeVP").getBoundingClientRect();
   minimapBoundaries = document.getElementById("minimap").getBoundingClientRect();

   translateWidthRatio = minimapBoundaries.width / viewportBoundaries.width;
   translateHeightRatio = minimapBoundaries.height / viewportBoundaries.height;

   translateWidth = Math.abs(translateX) * translateWidthRatio;
   translateHeight = Math.abs(translateY) * translateHeightRatio;

   minimapViewer.attr("transform", "translate(" + translateWidth + "," + translateHeight + ") scale(" + inverseK + 		")")
     .attr("style", "stroke-width:" + 2 * translateK + "px");
 }

 zoom = d3.zoom()
   .scaleExtent([1, 20])
   .translateExtent([
     [0, 0],
     [viewportDimensions.width, viewportDimensions.height]
   ])
   .on("zoom", zoomed);

 home.call(zoom);
