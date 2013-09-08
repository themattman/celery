$(function() {
	var clicked_opts = ["buy", "sell", "undef"];
	var clicked = clicked_opts[0];
	var courses_clicked = false;
	$('.btn').click(function(e){
		console.log(e.target.id);
		if(e.target.id === "insert"){
			$.get('/import', function(data){if(data === 'ok'){location.reload();}});
		} else if(e.target.id === "delete"){
			$.get('/drop', function(data){if(data === 'ok'){alert('deleted');}});
		} else if(e.target.id === "courses"){
			$('#'+clicked).removeClass('active');
			$('#table_'+clicked).hide();
			if(courses_clicked){
				$('#table_course').hide();
			} else {
				$('#table_course').fadeIn();
			}
			$('#courses').toggleClass('active');
		}else if(e.target.id !== clicked){
			$('#'+clicked).removeClass('active');
			$('#table_'+clicked).hide();
			clicked = e.target.id;
			$('#'+e.target.id).addClass('active');
			$('#table_'+e.target.id).fadeIn();
		}
	});

	// Flip the celery
	$(document).click(function(){
		console.log('ITS HAPPENING');
		$('.cel').addClass('bounce');
		setTimeout(function(){
			$('.cel').removeClass('bounce');
		}, 600);
	});
	console.log(window);
	//$('body').scrollTo('#table_cont', function(d){
	window.onscroll = function(){
		if(window.innerHeight + window.scrollY >= 1736){
			$('#bg').addClass('tfixed');
			$('#bg').removeClass('relative');
		} else {
			$('#bg').addClass('relative');
			$('#bg').removeClass('tfixed');
		}
		console.log(window.innerHeight + window.scrollY);
	};
});